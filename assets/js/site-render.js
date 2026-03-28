(function () {
  const publications = Array.isArray(window.SITE_PUBLICATIONS) ? window.SITE_PUBLICATIONS : [];
  const siteConfig = window.SITE_CONFIG || {};

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function linkAttrs(link) {
    const title = link.title ? ` title="${escapeHtml(link.title)}"` : "";
    const externalAttrs = link.href && link.href !== "#" ? ' target="_blank" rel="noreferrer"' : "";
    return `${title}${externalAttrs}`;
  }

  function renderSelectedThumb(publication) {
    const thumb = publication.thumb || {};
    if (thumb.type === "image") {
      const containClass = thumb.contain ? " teaser-contain" : "";
      return `
        <div class="paper-thumb${containClass}">
          <img src="${escapeHtml(thumb.src)}" alt="${escapeHtml(thumb.alt || publication.title)}">
          ${thumb.badge ? `<span class="thumb-badge">${escapeHtml(thumb.badge)}</span>` : ""}
        </div>
      `;
    }

    if (thumb.type === "synthetic") {
      const notes = Array.isArray(thumb.notes)
        ? thumb.notes.map((note) => `<span class="thumb-note">${escapeHtml(note)}</span>`).join("")
        : "";

      return `
        <div class="paper-thumb">
          <div class="thumb-shell thumb-crosel">
            ${thumb.badge ? `<span class="thumb-badge">${escapeHtml(thumb.badge)}</span>` : ""}
            <div>
              <div class="thumb-title">${escapeHtml(thumb.title || publication.title)}</div>
              <div class="thumb-subtitle">${escapeHtml(thumb.subtitle || "")}</div>
            </div>
            <div class="thumb-notes">${notes}</div>
            <div class="bars">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `;
    }

    return "";
  }

  function renderSelectedBadge(badge) {
    let classes = "meta-pill";
    if (badge.type === "oral") {
      classes += " oral";
    }
    if (badge.type === "rank-highlight") {
      classes += " rank highlight-rank";
    }
    return `<span class="${classes}">${escapeHtml(badge.label)}</span>`;
  }

  function renderSelectedLink(link) {
    const classes = link.primary ? "link-pill primary" : "link-pill";
    return `<a class="${classes}" href="${escapeHtml(link.href)}"${linkAttrs(link)}>${escapeHtml(link.label)}</a>`;
  }

  function renderSelectedWork(publication, index) {
    const delay = 30 + index * 60;
    return `
      <article class="paper-card fade-up" style="--delay: ${delay}ms;">
        ${renderSelectedThumb(publication)}
        <div class="paper-content">
          <div class="paper-head">
            ${(publication.badges || []).map(renderSelectedBadge).join("")}
          </div>
          <h3>${escapeHtml(publication.title)}</h3>
          <p class="paper-authors">${publication.authors || ""}</p>
          <p class="paper-venue">${escapeHtml(publication.venueShort || publication.venueFull || "")}</p>
          <p class="paper-summary">${escapeHtml(publication.summary || "")}</p>
          <div class="paper-links">
            ${(publication.selectedLinks || []).map(renderSelectedLink).join("")}
          </div>
        </div>
      </article>
    `;
  }

  function renderRating(rating) {
    const type = rating.type === "caai" ? "caai" : "ccf";
    return `<span class="rating-pill ${type}">${escapeHtml(rating.label)}</span>`;
  }

  function renderFullLink(link) {
    return `<a href="${escapeHtml(link.href)}"${linkAttrs(link)}>${escapeHtml(link.label)}</a>`;
  }

  function renderFullPublication(publication) {
    const ratings = (publication.ratings || []).length
      ? `<div class="pub-meta">${publication.ratings.map(renderRating).join("")}</div>`
      : "";

    return `
      <li>
        <div class="pub-title">${escapeHtml(publication.title)}</div>
        <div class="pub-authors">${publication.authors || ""}</div>
        <div class="pub-venue">${escapeHtml(publication.venueFull || publication.venueShort || "")}</div>
        ${ratings}
        <div class="pub-links">${(publication.fullLinks || []).map(renderFullLink).join("")}</div>
      </li>
    `;
  }

  function renderSelectedWorks() {
    const container = document.getElementById("selected-works-list");
    if (!container) {
      return;
    }

    const selected = publications.filter((publication) => publication.selected);
    container.innerHTML = selected.map(renderSelectedWork).join("");
  }

  function renderFullPublications() {
    const groups = [
      { id: "conference-list", category: "conference" },
      { id: "journal-list", category: "journal" },
      { id: "preprint-list", category: "preprint" }
    ];

    groups.forEach((group) => {
      const container = document.getElementById(group.id);
      if (!container) {
        return;
      }

      const items = publications.filter((publication) => publication.category === group.category);
      container.innerHTML = items.map(renderFullPublication).join("");
    });
  }

  async function fetchScholarStats() {
    const totalCitations = document.getElementById("scholar-total-citations");
    if (!totalCitations || !siteConfig.repository || !siteConfig.scholarStatsBranch) {
      return;
    }

    const baseUrls = [
      `https://cdn.jsdelivr.net/gh/${siteConfig.repository}@${siteConfig.scholarStatsBranch}/gs_data.json`,
      `https://raw.githubusercontent.com/${siteConfig.repository}/${siteConfig.scholarStatsBranch}/gs_data.json`
    ];

    for (const url of baseUrls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        if (typeof data.citedby !== "number") {
          continue;
        }

        totalCitations.textContent = `Citations: ${data.citedby}`;
        if (data.updated) {
          totalCitations.title = `Updated: ${data.updated}`;
        }
        return;
      } catch (error) {
        continue;
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSelectedWorks();
    renderFullPublications();
    fetchScholarStats();
  });
})();
