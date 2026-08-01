"use strict";

const API_BASE_URL = "https://daksh-rojgar-api.onrender.com";

const listingContainer = document.getElementById("listingContainer");
const listingTitle = document.getElementById("listingTitle");
const listingLabel = document.getElementById("listingLabel");
const listingDescription = document.getElementById("listingDescription");
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

const MODULE_CONFIG = {
    jobs: {
        title: "Government Jobs",
        label: "LATEST RECRUITMENTS",
        description: "Latest Rajasthan, Central and Private job updates.",
        endpoint: "/api/jobs",
        type: "job",
    },

    admit_card: {
        title: "Admit Cards",
        label: "LATEST ADMIT CARDS",
        description: "Download the latest examination admit cards.",
        endpoint: "/api/posts?category=admit_card",
        type: "post",
    },

    result: {
        title: "Exam Results",
        label: "LATEST RESULTS",
        description: "Check the latest recruitment and examination results.",
        endpoint: "/api/posts?category=result",
        type: "post",
    },

    answer_key: {
        title: "Answer Keys",
        label: "LATEST ANSWER KEYS",
        description: "Latest provisional and final answer keys.",
        endpoint: "/api/posts?category=answer_key",
        type: "post",
    },

    syllabus: {
        title: "Syllabus",
        label: "LATEST SYLLABUS",
        description: "Exam syllabus and preparation-related updates.",
        endpoint: "/api/posts?category=syllabus",
        type: "post",
    },

    current_affairs: {
        title: "Current Affairs",
        label: "DAILY CURRENT AFFAIRS",
        description: "Current affairs and useful study updates.",
        endpoint: "/api/posts?category=current_affairs",
        type: "post",
    },

    yojana: {
        title: "Government Schemes",
        label: "LATEST GOVERNMENT SCHEMES",
        description: "Central and State Government scheme information.",
        endpoint: "/api/posts?category=yojana",
        type: "post",
    },

    rajasthan_info: {
        title: "Rajasthan Information",
        label: "RAJASTHAN UPDATES",
        description: "Important Rajasthan information and updates.",
        endpoint: "/api/posts?category=rajasthan_info",
        type: "post",
    },

    emitra: {
        title: "eMitra Updates",
        label: "LATEST EMITRA INFORMATION",
        description: "Important eMitra services and update information.",
        endpoint: "/api/posts?category=emitra",
        type: "post",
    },

    all_posts: {
        title: "All Updates",
        label: "LATEST POSTS",
        description: "All recent posts published through Daksh Rojgar.",
        endpoint: "/api/posts",
        type: "post",
    },
};

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(value) {
    if (!value) {
        return "";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function getItemTitle(item) {
    return item.title_hi || item.title || "Latest Update";
}

function getItemSummary(item) {
    return (
        item.short_summary_hi ||
        item.short_summary ||
        item.description_hi ||
        item.description ||
        item.content_hi ||
        item.content ||
        item.qualification ||
        "View complete information."
    );
}

function getItemCategory(item, itemType) {
    if (itemType === "job") {
        return (
            item.organization_hi ||
            item.organization ||
            item.category ||
            "Government Job"
        );
    }

    return item.category || "Latest Update";
}

function getDetailLink(item, itemType) {
    if (!item || !item.id) {
        return "#";
    }

    if (itemType === "job") {
        /*
         * जब job.html तैयार होगा तो यही link उसकी
         * पूरी internal details खोलेगा।
         */
        return `job.html?id=${encodeURIComponent(item.id)}`;
    }

    return `post.html?id=${encodeURIComponent(item.id)}`;
}

function renderItems(items, itemType) {
    if (!listingContainer) {
        throw new Error("listingContainer element not found");
    }

    if (!Array.isArray(items)) {
        throw new Error("API response is not an array");
    }

    if (items.length === 0) {
        listingContainer.innerHTML = `
            <div class="listing-empty">
                <h2>No updates available</h2>
                <p>
                    Admin Panel से नई जानकारी publish होने पर
                    वह अपने-आप यहाँ दिखाई देगी।
                </p>
            </div>
        `;

        return;
    }

    const cards = items.map((item) => {
        const title = getItemTitle(item);
        const rawSummary = getItemSummary(item);
        const summary = String(rawSummary).replace(/\s+/g, " ").trim();
        const shortSummary =
            summary.length > 220
                ? `${summary.slice(0, 220)}...`
                : summary;

        const category = getItemCategory(item, itemType);

        const date = formatDate(
            item.updated_at ||
            item.created_at ||
            item.post_date
        );

        const detailLink = getDetailLink(item, itemType);

        const stateInfo =
            itemType === "job" && item.state
                ? `<span class="listing-state">${escapeHtml(item.state)}</span>`
                : "";

        const lastDate =
            itemType === "job" && item.last_date
                ? `
                    <p class="listing-last-date">
                        <strong>Last Date:</strong>
                        ${escapeHtml(item.last_date)}
                    </p>
                `
                : "";

        return `
            <article class="live-listing-card">
                <div class="listing-meta">
                    <span>${escapeHtml(category)}</span>
                    ${date ? `<time>${escapeHtml(date)}</time>` : ""}
                </div>

                ${stateInfo}

                <h2>${escapeHtml(title)}</h2>

                ${lastDate}

                <p>${escapeHtml(shortSummary)}</p>

                <a
                    href="${escapeHtml(detailLink)}"
                    class="listing-read-button"
                >
                    View Full Details →
                </a>
            </article>
        `;
    });

    listingContainer.innerHTML = cards.join("");
}

function showLoadError(error) {
    console.error("[Daksh Website] Listing failed:", error);

    if (!listingContainer) {
        return;
    }

    listingContainer.innerHTML = `
        <div class="listing-empty">
            <h2>Unable to load updates</h2>
            <p>
                ${escapeHtml(error?.message || "Unknown website error")}
            </p>
            <button
                type="button"
                class="listing-read-button"
                onclick="window.location.reload()"
            >
                Try Again
            </button>
        </div>
    `;
}

async function loadListing() {
    try {
        if (
            !listingContainer ||
            !listingTitle ||
            !listingLabel ||
            !listingDescription
        ) {
            throw new Error("Required listing page elements are missing");
        }

        const params = new URLSearchParams(window.location.search);
        const moduleName = params.get("module") || "all_posts";

        const config =
            MODULE_CONFIG[moduleName] ||
            MODULE_CONFIG.all_posts;

        listingTitle.textContent = config.title;
        listingLabel.textContent = config.label;
        listingDescription.textContent = config.description;
        document.title = `${config.title} | Daksh Rojgar`;

        const requestUrl = `${API_BASE_URL}${config.endpoint}`;

        console.log("[Daksh Website] Listing request:", requestUrl);

        const response = await fetch(requestUrl, {
            method: "GET",
            mode: "cors",
            cache: "no-store",
            headers: {
                Accept: "application/json",
            },
        });

        console.log(
            "[Daksh Website] Listing response:",
            response.status,
            response.statusText
        );

        if (!response.ok) {
            throw new Error(
                `API request failed with status ${response.status}`
            );
        }

        const items = await response.json();

        console.log(
            "[Daksh Website] Listing items loaded:",
            Array.isArray(items) ? items.length : items
        );

        renderItems(items, config.type);
    } catch (error) {
        showLoadError(error);
    }
}

loadListing();
