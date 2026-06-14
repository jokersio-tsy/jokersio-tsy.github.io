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

  function emphasizeAuthorName(html) {
    return String(html || "").replace(/(<u>Shi-Yu Tian<\/u>|Shi-Yu Tian)/g, "<strong>$1</strong>");
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
          <p class="paper-authors">${emphasizeAuthorName(publication.authors)}</p>
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

  function formatVenue(text) {
    const escaped = escapeHtml(text);
    return escaped.replace(/\(([^)]+)\)/, function(match, inner) {
      const highlighted = inner.replace(/Oral/g, '<span class="venue-oral">Oral</span>');
      return '<span class="venue-abbr">(' + highlighted + ')</span>';
    });
  }

  function renderFullPublication(publication) {
    const ratings = (publication.ratings || []).length
      ? `<div class="pub-meta">${publication.ratings.map(renderRating).join("")}</div>`
      : "";

    return `
      <li>
        <div class="pub-title">${escapeHtml(publication.title)}</div>
        <div class="pub-authors">${emphasizeAuthorName(publication.authors)}</div>
        <div class="pub-venue">${formatVenue(publication.venueFull || publication.venueShort || "")}</div>
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

  function renderHomeFullPublications() {
    const groups = [
      { id: "home-conference-list", category: "conference" },
      { id: "home-journal-list", category: "journal" },
      { id: "home-preprint-list", category: "preprint" }
    ];

    if (groups.every((group) => document.getElementById(group.id)?.dataset.rendered === "true")) {
      return;
    }

    groups.forEach((group) => {
      const container = document.getElementById(group.id);
      if (!container || container.dataset.rendered === "true") {
        return;
      }

      const items = publications.filter((publication) => publication.category === group.category);
      container.innerHTML = items.map(renderFullPublication).join("");
      container.dataset.rendered = "true";
    });
  }

  function setupHomePublicationTabs() {
    const tabs = Array.from(document.querySelectorAll("[data-publication-view]"));
    const selectedPanel = document.getElementById("selected-publications-panel");
    const allPanel = document.getElementById("all-publications-panel");

    if (!tabs.length || !selectedPanel || !allPanel) {
      return;
    }

    const panels = {
      selected: selectedPanel,
      all: allPanel
    };

    function activate(view) {
      const activeView = panels[view] ? view : "selected";
      if (activeView === "all") {
        renderHomeFullPublications();
      }

      tabs.forEach((tab) => {
        const isActive = tab.dataset.publicationView === activeView;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      Object.entries(panels).forEach(([key, panel]) => {
        panel.hidden = key !== activeView;
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activate(tab.dataset.publicationView));
    });

    activate("selected");
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

  function mondayKey(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const offset = (monday.getUTCDay() + 6) % 7;
    monday.setUTCDate(monday.getUTCDate() - offset);
    return monday.toISOString().slice(0, 10);
  }

  function timeFor(value) {
    const time = new Date(value || "").getTime();
    return Number.isFinite(time) ? time : Infinity;
  }

  function normalizeCitationHistory(data) {
    const rawHistory = Array.isArray(data && data.citation_history)
      ? data.citation_history
      : Array.isArray(data && data.weekly_citations)
        ? data.weekly_citations
        : [];

    const byWeek = new Map();
    rawHistory.forEach((entry) => {
      const updated = entry.updated || entry.date || entry.week || "";
      const week = entry.week || mondayKey(updated);
      const citedby = Number(entry.citedby ?? entry.citations ?? entry.total);
      if (week && Number.isFinite(citedby)) {
        const item = {
          week,
          citedby,
          updated
        };
        const existing = byWeek.get(week);
        const existingTime = existing ? timeFor(existing.updated || existing.week) : Infinity;
        const itemTime = timeFor(item.updated || item.week);
        if (!existing || itemTime < existingTime) {
          byWeek.set(week, item);
        }
      }
    });

    if (!byWeek.size && data && typeof data.citedby === "number") {
      const week = mondayKey(data.updated);
      if (week) {
        byWeek.set(week, {
          week,
          citedby: data.citedby,
          updated: data.updated || ""
        });
      }
    }

    return Array.from(byWeek.values()).sort((a, b) => a.week.localeCompare(b.week));
  }

  function renderCitationChart(data) {
    const chart = document.getElementById("citation-chart");
    const meta = document.getElementById("citation-chart-meta");
    if (!chart || !data) {
      return;
    }

    const entries = normalizeCitationHistory(data);
    if (!entries.length) {
      return;
    }

    const width = 720;
    const height = 235;
    const padding = { top: 24, right: 28, bottom: 48, left: 42 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const maxCitations = Math.max(...entries.map((entry) => entry.citedby), 1);
    const yMax = Math.ceil(maxCitations / 10) * 10 || maxCitations;

    const xFor = (index) => {
      if (entries.length === 1) {
        return padding.left + innerWidth / 2;
      }
      return padding.left + (index / (entries.length - 1)) * innerWidth;
    };
    const yFor = (value) => padding.top + innerHeight - (value / yMax) * innerHeight;

    const points = entries.map((entry, index) => ({
      ...entry,
      x: xFor(index),
      y: yFor(entry.citedby)
    }));
    const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padding.top + innerHeight).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padding.top + innerHeight).toFixed(1)} Z`;
    const gridValues = [0, Math.round(yMax / 2), yMax];
    const labelEvery = points.length <= 12 ? 1 : Math.ceil(points.length / 8);

    chart.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="citation-chart-title">
        <title id="citation-chart-title">Google Scholar total citations by week</title>
        ${gridValues.map((value) => {
          const y = yFor(value);
          return `
            <line class="grid-line" x1="${padding.left}" y1="${y.toFixed(1)}" x2="${width - padding.right}" y2="${y.toFixed(1)}"></line>
            <text x="${padding.left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end">${value}</text>
          `;
        }).join("")}
        <line class="axis" x1="${padding.left}" y1="${padding.top + innerHeight}" x2="${width - padding.right}" y2="${padding.top + innerHeight}"></line>
        <path class="trend-area" d="${areaPath}"></path>
        <path class="trend-line" d="${linePath}"></path>
        ${points.map((point, index) => {
          const showLabel = index === 0 || index === points.length - 1 || index % labelEvery === 0;
          return `
            <circle class="point" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5"></circle>
            <text class="value-label" x="${point.x.toFixed(1)}" y="${(point.y - 10).toFixed(1)}" text-anchor="middle">${point.citedby}</text>
            ${showLabel ? `<text x="${point.x.toFixed(1)}" y="${height - 14}" text-anchor="middle">${escapeHtml(point.week)}</text>` : ""}
          `;
        }).join("")}
      </svg>
    `;

    if (meta) {
      const updated = data.updated ? new Date(data.updated) : null;
      const updatedText = updated && !Number.isNaN(updated.getTime())
        ? updated.toISOString().slice(0, 10)
        : "";
      meta.innerHTML = `
        <span><strong>${escapeHtml(data.citedby || 0)}</strong> total citations</span>
        ${updatedText ? `<span>Updated ${escapeHtml(updatedText)}</span>` : ""}
        ${entries.length === 1 ? `<span>Weekly history starts ${escapeHtml(entries[0].week)}</span>` : ""}
      `;
    }
  }

  function applyScholarStats(data, totalCitations, citationHistory) {
    if (!data || typeof data.citedby !== "number") {
      return false;
    }

    if (totalCitations) {
      if (totalCitations.tagName === "IMG") {
        totalCitations.alt = `Citations: ${data.citedby}`;
      } else {
        totalCitations.textContent = `Citations: ${data.citedby}`;
      }
      if (data.updated) {
        totalCitations.title = `Updated: ${data.updated}`;
      }
    }
    renderCitationChart({
      ...data,
      citation_history: citationHistory || data.citation_history
    });
    return true;
  }

  async function fetchCitationHistory() {
    const urls = [
      `https://cdn.jsdelivr.net/gh/${siteConfig.repository}@${siteConfig.scholarStatsBranch}/citation_history.json`,
      `https://raw.githubusercontent.com/${siteConfig.repository}/${siteConfig.scholarStatsBranch}/citation_history.json`
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
          continue;
        }
        const history = await response.json();
        if (Array.isArray(history)) {
          return history;
        }
      } catch (error) {
        continue;
      }
    }
    return null;
  }

  async function fetchScholarStats() {
    const totalCitations = document.getElementById("scholar-total-citations");
    const citationChart = document.getElementById("citation-chart");
    if ((!totalCitations && !citationChart) || !siteConfig.repository || !siteConfig.scholarStatsBranch) {
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
        const citationHistory = await fetchCitationHistory();
        if (applyScholarStats(data, totalCitations, citationHistory)) {
          return;
        }
      } catch (error) {
        continue;
      }
    }

    applyScholarStats(siteConfig.citationFallback, totalCitations);
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSelectedWorks();
    renderFullPublications();
    setupHomePublicationTabs();
    fetchScholarStats();
  });
})();
