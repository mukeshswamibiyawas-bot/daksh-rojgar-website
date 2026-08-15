"use strict";

const API_BASE_URL =
"https://daksh-rojgar-api.onrender.com";

const PUBLIC_SITE_URL =
    "https://mukeshswamibiyawas-bot.github.io/daksh-rojgar-website";

const postDetail =
    document.getElementById("postDetail");

const currentYear =
    document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent =
        new Date().getFullYear();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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

function createLinkButton(
    label,
    url,
    className = "detail-button"
) {
    const absoluteUrl =
        makeAbsoluteUrl(url);

    if (!absoluteUrl) {
        return "";
    }

    return `
        <a
            href="${escapeHtml(absoluteUrl)}"
            class="${className}"
            target="_blank"
            rel="noopener noreferrer"
        >
            ${escapeHtml(label)}
        </a>
    `;
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

function renderPost(post) {
    const title =
        post.title_hi ||
        post.title ||
        "Post Details";

    const category =
        post.category ||
        "Latest Update";

    const postDate =
        post.post_date
            ? new Date(
                  post.post_date
              ).toLocaleDateString(
                  "en-IN",
                  {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                  }
              )
            : "";

    const imageUrl = makeAbsoluteUrl(
        post.image_url ||
        post.pdf_url
    );

    const actionButtons = [
        createLinkButton(
            "Download",
            post.download_link ||
                post.pdf_url
        ),

        createLinkButton(
            "Download Admit Card",
            post.download_admit_card_link
        ),

        createLinkButton(
            "Check Result",
            post.download_result_link
        ),

        createLinkButton(
            "Download Answer Key",
            post.download_answer_key_link
        ),

        createLinkButton(
            "Download Cut Off",
            post.download_cutoff_link
        ),

        createLinkButton(
            "Download Syllabus",
            post.download_syllabus_link
        ),

        createLinkButton(
            "Apply Online",
            post.apply_link,
            "detail-button primary"
        ),

        createLinkButton(
            "Official Website",
            post.official_website
        ),
    ]
        .filter(Boolean)
        .join("");

    postDetail.innerHTML = `
        <div class="legal-heading">
            <span>
                ${escapeHtml(category)}
            </span>

            <h1>
                ${escapeHtml(title)}
            </h1>

            ${
                postDate
                    ? `<p>Published: ${escapeHtml(postDate)}</p>`
                    : ""
            }
        </div>

        ${
            imageUrl
                ? `
                    <div class="detail-media">
                        <img
                            src="${escapeHtml(imageUrl)}"
                            alt="${escapeHtml(title)}"
                            loading="lazy"
                        >
                    </div>
                `
                : ""
        }

        ${
            actionButtons
                ? `
                    <div class="detail-actions">
                        ${actionButtons}
                    </div>
                `
                : ""
        }

        ${renderSection(
            "Overview",
            post.short_summary_hi ||
            post.short_summary ||
            post.content_hi ||
            post.content
        )}

        ${renderSection(
            "Important Dates",
            post.important_dates
        )}

        ${renderSection(
            "Exam Details",
            post.exam_details
        )}

        ${renderSection(
            "Eligibility / Information",
            post.eligibility_or_info
        )}

        ${renderSection(
            "How to Check",
            post.how_to_check
        )}

        ${renderSection(
            "How to Download",
            post.how_to_download
        )}

        ${
            post.organization
                ? `
                    <section class="detail-section">
                        <h2>Organization</h2>
                        <p>
                            ${escapeHtml(
                                post.organization_hi ||
                                post.organization
                            )}
                        </p>
                    </section>
                `
                : ""
        }
    `;
}

function showError(message) {
    postDetail.innerHTML = `
        <div class="detail-error">
            <h1>Post Not Found</h1>

            <p>
                ${escapeHtml(message)}
            </p>

            <a
                href="index.html"
                class="detail-button primary"
            >
                Back to Home
            </a>
        </div>
    `;
}

async function loadPost() {
    try {
        const parameters =
            new URLSearchParams(
                window.location.search
            );

        const postId =
            parameters.get("id");

        if (!postId) {
            throw new Error(
                "Post ID is missing."
            );
        }

        const response = await fetch(
            `${API_BASE_URL}/api/posts/${encodeURIComponent(postId)}`,
            {
                headers: {
                    Accept:
                        "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(
                `Post request failed: ${response.status}`
            );
        }

        const post =
            await response.json();

        const seoTitle =
            post.title_hi ||
            post.title ||
            "Latest Update";

        document.title =
            `${seoTitle} | Daksh Rojgar`;

        const pageDescription =
            document.getElementById(
                "pageDescription"
            );

        if (pageDescription) {
            const description =
                post.short_summary_hi ||
                post.short_summary ||
                post.content_hi ||
                post.content ||
                "Latest update on Daksh Rojgar.";

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
                `${PUBLIC_SITE_URL}/post.html?id=${encodeURIComponent(postId)}`
            );
        }

        renderPost(post);
    } catch (error) {
        console.error(
            "[Daksh Website] Post detail failed:",
            error
        );

        showError(
            "The requested post could not be loaded."
        );
    }
}

loadPost();


