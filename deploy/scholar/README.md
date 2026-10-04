# ECS Scholar updater

The server runs the existing crawler from `/opt/homepage-scholar` as the
unprivileged `scholar-updater` account. Its home and writable state are
`/var/lib/homepage-scholar`. No desktop session is required.

## Installation

1. Create the system account with home `/var/lib/homepage-scholar` and group
   `scholar-updater`. Install Git, the Python venv prerequisite, and the project
   under `/opt/homepage-scholar`. Keep the code and venv root-owned, readable by
   the service account. Create `/opt/homepage-scholar/venv`, install
   `google_scholar_crawler/requirements.txt`, run `pip check`, then run both the
   crawler tests and the deployment tests below using that interpreter.
2. Copy `updater.env.example` to `/etc/homepage-scholar/updater.env`; keep this
   file root-owned and mode `0600`. Systemd reads it before changing user. Set
   the actual repository SSH alias if necessary. The supplied HTTP proxy must
   already be available on the **server's** `127.0.0.1:7897` and independently
   start at boot. The supplied units depend on `scholar-proxy.service`; its
   loopback-only configuration is described in [../proxy/README.md](../proxy/README.md).
3. Give `scholar-updater` a repository-scoped write deploy key, SSH configuration,
   and verified GitHub host keys in `/var/lib/homepage-scholar/.ssh` (directory
   `0700`, private key `0600`). SSH is non-interactive. Do not put tokens in the
   repository URL. Ensure Git can fetch and push through the server's permitted
   route; the `SCHOLAR_*_PROXY` variables configure Scholar, not Git's SSH route.
4. Test a complete crawler fetch without publishing. Before the server's first
   write, remove/disable every old Actions publishing trigger and confirm all
   queued/in-progress publisher runs have completed or been cancelled. The old
   publisher used force pushes; leaving a run in flight can overwrite new data.
   The repository workflow now runs offline validation only.
5. Install both unit files under `/etc/systemd/system/`, run
   `systemctl daemon-reload`, then `systemctl start homepage-scholar.service`.
   Inspect status and confirm the remote stats commit. After a successful
   server run, enable the schedule with
   `systemctl enable --now homepage-scholar.timer`.

The runner uses only Python's standard library. Python 3.14.4 passed the pinned
dependency import and crawler regression tests on the ECS on 2026-10-04. The
workflow also validates Python 3.11 and 3.14. No desktop session or container is
required.

## Publication and failure behavior

- A nonblocking `flock` prevents overlapping manual and scheduled runs.
- `/var/lib/homepage-scholar/stats` is a **dedicated disposable Git checkout**.
  Each run fetches full branch history and resets this checkout to the remote
  head. Do not put manual work in it. The application checkout is never reset.
- Every attempt uses a fresh temporary results directory and restores validated
  citation history from the remote stats branch. The crawler gets three 180 s
  deadlines, with 15 s between attempts; its entire process group is terminated
  on a timeout, including browser children.
- All three JSON files must agree, identify the requested author, contain fresh
  data and at least one valid publication, and preserve every published weekly
  history entry. Incomplete or invalid responses never reach the stats checkout
  or remote branch. The existing weekly policy keeps the earliest reading.
- Publication creates a normal child commit and uses an ordinary fast-forward
  push. A concurrent remote update causes a failure; there is no force push or
  merge of conflicting statistics. The next service attempt fetches fresh
  history. Git commands have 60 s deadlines.
- Failed services retry after 15 minutes, up to three service starts in six
  hours (each with up to three crawler attempts). Exhausted retries remain
  failed until the next daily timer or manual `reset-failed`/start. The timer
  runs at 03:00 UTC / 11:00 Asia/Shanghai and catches missed starts after boot.

## Observe and test

```sh
systemctl list-timers homepage-scholar.timer
systemctl status homepage-scholar.service
journalctl -u homepage-scholar.service -n 100 --no-pager
cat /var/lib/homepage-scholar/status.json
/opt/homepage-scholar/venv/bin/python -m unittest discover -s /opt/homepage-scholar/deploy/scholar -p 'test_*.py'
```

`status.json` is atomically replaced and records the current phase/attempt,
last result, and most recent successful commit/count/timestamp. Failure retains
`last_success`. A killed service can leave `status=running`; compare it with
systemd state and the recorded start time. Never treat that state as success.
If a push times out, check the remote commit before assuming it was rejected.

Tests use temporary local bare Git repositories and fake crawler programs;
they do not contact Scholar, GitHub, or the ECS instance.
