# Server-side Scholar proxy

The crawler explicitly uses `http://127.0.0.1:7897` on the ECS. The proxy runs as
`scholar-proxy`, independently of the desktop. It does not change system-wide
proxy settings, use TUN, or expose a LAN/public listener or controller API.

The deployed binary is the official Mihomo v1.19.32 Linux amd64-v1 release:

- Asset: https://github.com/MetaCubeX/mihomo/releases/download/v1.19.32/mihomo-linux-amd64-v1-v1.19.32.gz
- Compressed asset SHA256: `306f81e723e60ce6b828899a6fe83e1d00e9ecefb2dc8d4d849312a5bc00efdc`
- Executable: `/usr/local/lib/scholar-proxy/mihomo`
- Private config: `/etc/scholar-proxy/config.yaml`, owner `root:scholar-proxy`, mode `0640`
- Private provider cache: `/var/lib/scholar-proxy/providers/subscription.yaml`,
  owner `scholar-proxy:scholar-proxy`, mode `0600`

The user-authorized subscription is an HTTP provider that refreshes every six
hours. A local provider cache supplies the initial nodes. Only the subscription's
`proxies` are imported, not its global DNS, rules or listeners. The fallback group
prefers the selected desktop node and uses a normal HTTP 204 endpoint for health
checks every ten minutes. This detects transport failures, not Scholar CAPTCHA
or HTTP 403 responses. The actual crawler result remains the success criterion.

Subscription URLs and node credentials stay in the private server configuration
and ignored local `.local/` staging directory. Do not copy those into this repo.
The provider's node TLS verification is enabled. If the subscription source or
account expires, repair that configuration and validate a full fetch again.

```sh
systemctl status scholar-proxy.service
ss -lntp 'sport = :7897'
runuser -u scholar-proxy -- /usr/local/lib/scholar-proxy/mihomo -t \
  -d /var/lib/scholar-proxy -f /etc/scholar-proxy/config.yaml
curl --proxy http://127.0.0.1:7897 --connect-timeout 10 --max-time 30 \
  -o /dev/null -sS -w '%{http_code}\n' https://www.gstatic.com/generate_204
```

The service starts at boot and restarts on failure. GitHub SSH publishing uses
the dedicated updater key and its own connection, not the Scholar HTTP proxy.
