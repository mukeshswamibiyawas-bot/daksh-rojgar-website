"use strict";
const API_BASE_URL = "https://daksh-rojgar-api.onrender.com";
const el = (id) => document.getElementById(id);
const listingContainer = el("listingContainer");
const listingTitle = el("listingTitle");
const listingLabel = el("listingLabel");
const listingDescription = el("listingDescription");

const MODULE_CONFIG = {
  jobs: { title: "Latest Jobs", label: "LATEST RECRUITMENTS", description: "Latest Rajasthan, Central and Private job updates.", type: "job" },
  admit_card: { title: "Admit Cards", label: "LATEST ADMIT CARDS", description: "Latest examination admit card notifications.", category: "admit_card", type: "post" },
  result: { title: "Results", label: "LATEST RESULTS", description: "Latest recruitment and examination results.", category: "result", type: "post" },
  answer_key: { title: "Answer Key", label: "LATEST ANSWER KEYS", description: "Latest provisional and final answer keys.", category: "answer_key", type: "post" },
  syllabus: { title: "Syllabus", label: "LATEST SYLLABUS", description: "Exam syllabus and preparation updates.", category: "syllabus", type: "post" },
  current_affairs: { title: "Current Affairs", label: "CURRENT AFFAIRS", description: "Current affairs and study updates.", category: "current_affairs", type: "post" },
  yojana: { title: "Schemes & Yojana", label: "LATEST SCHEMES", description: "Useful Central and State scheme information.", category: "yojana", type: "post" },
  all_updates: { title: "All Latest Updates", label: "ALL NOTIFICATIONS", description: "Jobs, admit cards, results, answer keys, syllabus and current affairs in one compact list.", type: "all" },
  all_posts: { title: "All Updates", label: "LATEST POSTS", description: "All recent posts published through Daksh Rojgar.", type: "post" }
};

const norm = (v) => String(v || "").trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
const moduleOf = (item) => {
  if (item.source_type === "job") return "jobs";
  const values = [item.category, item.module, item.post_type, item.type, item.section, item.content_type].map(norm);
  for (const v of values) {
    if (!v) continue;
    if (v.includes("admit")) return "admit_card";
    if (v.includes("result")) return "result";
    if (v === "answerkey" || v.includes("answer_key")) return "answer_key";
    if (v.includes("syllabus")) return "syllabus";
    if (v.includes("current_affair")) return "current_affairs";
    if (v.includes("yojana") || v.includes("scheme")) return "yojana";
  }
  return "";
};
const esc = (v) => String(v ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
const strip = (v) => new DOMParser().parseFromString(String(v || ""), "text/html").body.textContent.replace(/\s+/g," ").trim();
const itemDate = (i) => new Date(i.updated_at || i.created_at || i.post_date || 0);
const fmt = (i) => { const d=itemDate(i); return Number.isNaN(d.getTime()) || d.getTime()===0 ? "" : d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); };
const titleOf = (i) => i.title_hi || i.title || "Latest Update";
const summaryOf = (i) => strip(i.short_summary_hi || i.short_summary || i.description_hi || i.description || i.content_hi || i.content || i.qualification || "View complete information.");
const categoryOf = (i) => i.source_type === "job" ? (i.organization_hi || i.organization || i.category || "Job") : (i.category || "Latest Update");
const detailOf = (i) => i.source_type === "job" ? `job.html?id=${encodeURIComponent(i.id)}` : `post.html?id=${encodeURIComponent(i.id)}`;

function render(items) {
  if (!items.length) {
    listingContainer.innerHTML = '<div class="listing-empty"><h2>अभी कोई update उपलब्ध नहीं है</h2><p>नई जानकारी publish होने पर यहाँ दिखाई देगी।</p></div>';
    return;
  }
  listingContainer.innerHTML = items.map(i => {
    const s = summaryOf(i); const short = s.length > 135 ? s.slice(0,135) + "..." : s;
    return `<article class="live-listing-card">
      <div class="listing-meta"><span>${esc(categoryOf(i))}</span>${fmt(i)?`<time>${esc(fmt(i))}</time>`:""}</div>
      <h2>${esc(titleOf(i))}</h2>
      <p>${esc(short)}</p>
      <a class="listing-read-button" href="${esc(detailOf(i))}">पूरा विवरण →</a>
    </article>`;
  }).join("");
}

async function fetchJson(url) {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`API request failed: ${r.status}`);
  const d = await r.json();
  return Array.isArray(d) ? d : [];
}

async function load() {
  try {
    const moduleName = new URLSearchParams(location.search).get("module") || "all_updates";
    const cfg = MODULE_CONFIG[moduleName] || MODULE_CONFIG.all_updates;
    listingTitle.textContent = cfg.title;
    listingLabel.textContent = cfg.label;
    listingDescription.textContent = cfg.description;
    document.title = `${cfg.title} | Daksh Rojgar`;

    let items = [];
    if (cfg.type === "job") {
      items = (await fetchJson(`${API_BASE_URL}/api/jobs`)).map(i => ({...i, source_type:"job"}));
    } else if (cfg.type === "post") {
      items = (await fetchJson(`${API_BASE_URL}/api/posts`)).map(i => ({...i, source_type:"post"}));
      if (cfg.category) items = items.filter(i => moduleOf(i) === cfg.category);
    } else {
      const [jobs, posts] = await Promise.all([
        fetchJson(`${API_BASE_URL}/api/jobs`),
        fetchJson(`${API_BASE_URL}/api/posts`)
      ]);
      items = [...jobs.map(i=>({...i,source_type:"job"})), ...posts.map(i=>({...i,source_type:"post"}))];
    }
    items.sort((a,b) => itemDate(b) - itemDate(a));
    render(items);
  } catch (err) {
    console.error(err);
    listingContainer.innerHTML = `<div class="listing-empty"><h2>Updates load नहीं हो पाए</h2><p>${esc(err.message || "Unknown error")}</p></div>`;
  }
}
load();
