"use strict";

const API_BASE_URL =
"https://daksh-rojgar-api.onrender.com";

const PUBLIC_SITE_URL =
    "https://mukeshswamibiyawas-bot.github.io/daksh-rojgar-website";

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

function renderSection(title, content) {
    if (!content) {
        return "";
    }

    return `
        <section class="detail-section">
            <h2>${escapeHtml(title)}</h2>

            <div class="detail-text">
                ${textToParagraphs(content)}
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

        const seoTitle =
            job.title_hi ||
            job.title ||
            "Government Job";

        document.title =
            `${seoTitle} | Daksh Rojgar`;

        const pageDescription =
            document.getElementById(
                "pageDescription"
            );

        if (pageDescription) {
            const description =
                job.short_summary_hi ||
                job.short_summary ||
                job.description_hi ||
                job.description ||
                "Government job details on Daksh Rojgar.";

            pageDescription.setAttribute(
                "content",
                String(description)
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 160)
            );
        }

        const pageCanonical =
            document.getElementById(
                "pageCanonical"
            );

        if (pageCanonical) {
            pageCanonical.setAttribute(
                "href",
                `${PUBLIC_SITE_URL}/job.html?id=${encodeURIComponent(jobId)}`
            );
        }

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


