"use strict";

const API_BASE_URL =
"https://daksh-rojgar-api.onrender.com";

const jobDetail =
    document.getElementById("jobDetail");

const currentYear =
    document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function makeAbsoluteUrl(url) {
    if (!url) {
        return "";
    }

    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {
        return url;
    }

    return `${API_BASE_URL}${
        url.startsWith("/") ? "" : "/"
    }${url}`;
}

function textToParagraphs(value) {
    if (!value) {
        return "";
    }

    return escapeHtml(value)
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => `<p>${line}</p>`)
        .join("");
}

function sanitizeRichHtml(value) {
    const doc = new DOMParser().parseFromString(String(value || ""), "text/html");

    doc.querySelectorAll("script, style, iframe, object, embed").forEach((el) => el.remove());

    doc.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
            const name = attr.name.toLowerCase();
            const val = String(attr.value || "").trim().toLowerCase();

            if (name.startsWith("on")) {
                el.removeAttribute(attr.name);
            }

            if ((name === "href" || name === "src") && val.startsWith("javascript:")) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return doc.body.innerHTML;
}

function richContentToHtml(value) {
    if (!value) {
        return "";
    }

    const text = String(value);
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(text);

    if (looksLikeHtml) {
        return sanitizeRichHtml(text);
    }

    return escapeHtml(text)
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line) => `<p>${line}</p>`)
        .join("");
}
function renderSection(title, content) {
    if (!content) {
        return "";
    }

    return `
        <section class="detail-section">
            <h2>${escapeHtml(title)}</h2>

            <div class="detail-text rich-content">
                ${richContentToHtml(content)}
            </div>
        </section>
    `;
}

function createButton(
    label,
    url,
    primary = false
) {
    const finalUrl =
        makeAbsoluteUrl(url);

    if (!finalUrl) {
        return "";
    }

    return `
        <a
            href="${escapeHtml(finalUrl)}"
            class="detail-button${primary ? " primary" : ""}"
            target="_blank"
            rel="noopener noreferrer"
        >
            ${escapeHtml(label)}
        </a>
    `;
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function normalizeDateForSchema(value, endOfDay = false) {
    if (!value) return "";
    const raw = String(value).trim();
    let match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[1] + "-" + match[2] + "-" + match[3] + (endOfDay ? "T23:59:59+05:30" : "");
    match = raw.match(/^(\d{2})[\\/-](\d{2})[\\/-](\d{4})/);
    if (match) return match[3] + "-" + match[2] + "-" + match[1] + (endOfDay ? "T23:59:59+05:30" : "");
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10) + (endOfDay ? "T23:59:59+05:30" : "");
}

function updateMeta(id, content) {
    const element = document.getElementById(id);
    if (element && content) element.setAttribute("content", content);
}

function buildSeoDescription(job) {
    const source = job.short_summary_hi || job.short_summary || job.description_hi || job.description || "";
    return String(source).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
}

function buildJobPostingDescription(job) {
    const sections = [
        ["Description", job.description_hi || job.description],
        ["Important Dates", job.important_dates],
        ["Application Fee", job.application_fee],
        ["Age Limit", job.age_limit],
        ["Vacancy Details", job.vacancy_details],
        ["Qualification", job.qualification],
        ["Eligibility", job.eligibility],
        ["Selection Mode", job.selection_mode],
        ["How to Apply", job.how_to_apply],
        ["Salary", job.salary],
    ];
    return sections.filter(([, value]) => value).map(([label, value]) => "<p><strong>" + escapeHtml(label) + ":</strong> " + richContentToHtml(value) + "</p>").join("");
}

function setJobSeo(job, jobId) {
    const title = job.title_hi || job.title || "Government Job";
    const organization = job.organization_hi || job.organization || "";
    const pageUrl = window.location.origin + window.location.pathname + "?id=" + encodeURIComponent(jobId);
    const seoTitle = organization ? title + " - " + organization + " | Daksh Rojgar" : title + " | Daksh Rojgar";
    const description = buildSeoDescription(job) || "Latest " + title + " recruitment details, eligibility, dates and official application information on Daksh Rojgar.";
    document.title = seoTitle;
    const canonical = document.getElementById("pageCanonical");
    if (canonical) canonical.setAttribute("href", pageUrl);
    updateMeta("pageDescription", description);
    updateMeta("ogTitle", seoTitle);
    updateMeta("ogDescription", description);
    updateMeta("ogUrl", pageUrl);
    const existingSchema = document.getElementById("jobPostingSchema");
    if (existingSchema) existingSchema.remove();
    const datePosted = normalizeDateForSchema(job.post_date || job.created_at || job.updated_at);
    const validThrough = normalizeDateForSchema(job.last_date, true);
    const locationText = String(job.state || "").trim();
    const genericLocations = new Set(["", "all india", "india", "central", "central government", "private"]);
    const applyUrl = makeAbsoluteUrl(job.apply_link);
    const descriptionHtml = buildJobPostingDescription(job);
    if (!datePosted || !organization || !descriptionHtml || !applyUrl || genericLocations.has(locationText.toLowerCase())) return;
    const schema = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": title,
        "description": descriptionHtml,
        "datePosted": datePosted,
        "hiringOrganization": { "@type": "Organization", "name": organization },
        "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressRegion": locationText, "addressCountry": "IN" } },
        "url": pageUrl,
    };
    if (validThrough) schema.validThrough = validThrough;
    const officialWebsite = makeAbsoluteUrl(job.official_website);
    if (officialWebsite) schema.hiringOrganization.sameAs = officialWebsite;
    const script = document.createElement("script");
    script.id = "jobPostingSchema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}
function renderJob(job) {
    const title =
        job.title_hi ||
        job.title ||
        "Government Job";

    const organization =
        job.organization_hi ||
        job.organization ||
        "";

    const publishedDate =
        formatDate(
            job.updated_at ||
            job.created_at ||
            job.post_date
        );

    const buttons = [
        createButton(
            "Apply Online",
            job.apply_link,
            true
        ),

        createButton(
            "Download Notification",
            job.download_notification_link ||
            job.pdf_url
        ),

        createButton(
            "Official Website",
            job.official_website
        ),

        createButton(
            "Download Syllabus",
            job.syllabus_link
        ),

        createButton(
            "WhatsApp",
            job.whatsapp_link
        ),

        createButton(
            "Telegram",
            job.telegram_link
        ),
    ]
        .filter(Boolean)
        .join("");

    setJobSeo(job, new URLSearchParams(window.location.search).get("id") || job.id || "");

    jobDetail.innerHTML = `
        <div class="legal-heading">

            <span>
                ${escapeHtml(
                    job.category ||
                    "Government Job"
                )}
            </span>

            <h1>
                ${escapeHtml(title)}
            </h1>

            ${
                organization
                    ? `
                        <p>
                            ${escapeHtml(organization)}
                        </p>
                    `
                    : ""
            }

            ${
                publishedDate
                    ? `
                        <p>
                            Published:
                            ${escapeHtml(publishedDate)}
                        </p>
                    `
                    : ""
            }

        </div>

        <section class="detail-summary-grid">

            ${
                job.state
                    ? `
                        <div>
                            <strong>State</strong>
                            <span>${escapeHtml(job.state)}</span>
                        </div>
                    `
                    : ""
            }

            ${
                job.type
                    ? `
                        <div>
                            <strong>Job Type</strong>
                            <span>${escapeHtml(job.type)}</span>
                        </div>
                    `
                    : ""
            }

            ${
                job.last_date
                    ? `
                        <div>
                            <strong>Last Date</strong>
                            <span>${escapeHtml(job.last_date)}</span>
                        </div>
                    `
                    : ""
            }

            ${
                job.total_posts ||
                job.vacancies
                    ? `
                        <div>
                            <strong>Total Posts</strong>
                            <span>
                                ${escapeHtml(
                                    job.total_posts ||
                                    job.vacancies
                                )}
                            </span>
                        </div>
                    `
                    : ""
            }

        </section>

        ${
            buttons
                ? `
                    <div class="detail-actions">
                        ${buttons}
                    </div>
                `
                : ""
        }

        ${renderSection(
            "Overview",
            job.short_summary_hi ||
            job.short_summary ||
            job.description_hi ||
            job.description
        )}

        ${renderSection(
            "Important Dates",
            job.important_dates
        )}

        ${renderSection(
            "Application Fee",
            job.application_fee
        )}

        ${renderSection(
            "Age Limit",
            job.age_limit
        )}

        ${renderSection(
            "Vacancy Details",
            job.vacancy_details
        )}

        ${renderSection(
            "Qualification",
            job.qualification
        )}

        ${renderSection(
            "Eligibility",
            job.eligibility
        )}

        ${renderSection(
            "Selection Mode",
            job.selection_mode
        )}

        ${renderSection(
            "How to Apply",
            job.how_to_apply
        )}

        ${renderSection(
            "Salary",
            job.salary
        )}
    `;
}

function showError(message) {
    jobDetail.innerHTML = `
        <div class="detail-error">

            <h1>Job Not Found</h1>

            <p>
                ${escapeHtml(message)}
            </p>

            <a
                href="listing.html?module=jobs"
                class="detail-button primary"
            >
                Back to Jobs
            </a>

        </div>
    `;
}

async function loadJob() {
    try {
        const params =
            new URLSearchParams(
                window.location.search
            );

        const jobId =
            params.get("id");

        if (!jobId) {
            throw new Error(
                "Job ID is missing."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/api/jobs/${encodeURIComponent(jobId)}`,
            {
                headers: {
                    Accept: "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                `Job request failed: ${response.status}`
            );
        }

        const job =
            await response.json();

        renderJob(job);
    } catch (error) {
        console.error(
            "[Daksh Website] Job detail failed:",
            error
        );

        showError(
            "The requested job could not be loaded."
        );
    }
}

loadJob();


