from pathlib import Path
from datetime import datetime
from urllib.request import urlopen
import json
import html

SITE = "https://mukeshswamibiyawas-bot.github.io/daksh-rojgar-website"
API = "https://daksh-rojgar-api.onrender.com"

STATIC_URLS = [
    (f"{SITE}/", "1.0"),
    (f"{SITE}/listing.html?module=jobs", "0.9"),
    (f"{SITE}/listing.html?module=admit_card", "0.8"),
    (f"{SITE}/listing.html?module=result", "0.8"),
    (f"{SITE}/listing.html?module=answer_key", "0.8"),
    (f"{SITE}/listing.html?module=syllabus", "0.8"),
    (f"{SITE}/listing.html?module=current_affairs", "0.8"),
    (f"{SITE}/listing.html?module=yojana", "0.8"),
    (f"{SITE}/listing.html?module=rajasthan_info", "0.8"),
    (f"{SITE}/listing.html?module=emitra", "0.7"),
    (f"{SITE}/photo-tools.html", "0.7"),
    (f"{SITE}/pdf-tools.html", "0.7"),
    (f"{SITE}/contact.html", "0.4"),
    (f"{SITE}/privacy-policy.html", "0.3"),
]

def fetch_json(url):
    with urlopen(url, timeout=60) as response:
        return json.load(response)

def normalize_date(value):
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(
            value.replace("Z", "+00:00")
        )
        return dt.date().isoformat()
    except Exception:
        return None

jobs = fetch_json(f"{API}/api/jobs")
posts = fetch_json(f"{API}/api/posts")

lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]

for url, priority in STATIC_URLS:
    lines.extend([
        "  <url>",
        f"    <loc>{html.escape(url)}</loc>",
        f"    <priority>{priority}</priority>",
        "  </url>",
    ])

for job in jobs:
    job_id = job.get("id")
    if not job_id:
        continue

    url = f"{SITE}/job.html?id={job_id}"
    lastmod = normalize_date(
        job.get("updated_at") or
        job.get("created_at") or
        job.get("post_date")
    )

    lines.append("  <url>")
    lines.append(f"    <loc>{html.escape(url)}</loc>")
    if lastmod:
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
    lines.append("    <priority>0.8</priority>")
    lines.append("  </url>")

for post in posts:
    post_id = post.get("id")
    if not post_id:
        continue

    url = f"{SITE}/post.html?id={post_id}"
    lastmod = normalize_date(
        post.get("updated_at") or
        post.get("created_at") or
        post.get("post_date")
    )

    lines.append("  <url>")
    lines.append(f"    <loc>{html.escape(url)}</loc>")
    if lastmod:
        lines.append(f"    <lastmod>{lastmod}</lastmod>")
    lines.append("    <priority>0.7</priority>")
    lines.append("  </url>")

lines.append("</urlset>")

output = "\n".join(lines) + "\n"

Path("sitemap.xml").write_text(
    output,
    encoding="utf-8",
    newline="\n"
)

print("DYNAMIC SITEMAP GENERATED")
print(f"Jobs added: {len(jobs)}")
print(f"Posts added: {len(posts)}")
print(
    f"Total URLs: "
    f"{len(STATIC_URLS) + len(jobs) + len(posts)}"
)
