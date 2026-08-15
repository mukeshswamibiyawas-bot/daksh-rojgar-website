"use strict";

const API_BASE_URL = "https://daksh-rojgar-api.onrender.com";

const PUBLIC_SITE_URL =
    "https://mukeshswamibiyawas-bot.github.io/daksh-rojgar-website";

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
        seoTitle: "Latest Government Jobs 2026 | Daksh Rojgar",
        seoDescription: "Check latest government jobs, Rajasthan jobs, central government vacancies, recruitment updates, eligibility and application details on Daksh Rojgar.",
        endpoint: "/api/jobs",
        type: "job",
    },

    admit_card: {
        title: "Admit Cards",
        label: "LATEST ADMIT CARDS",
        description: "Download the latest examination admit cards.",
        seoTitle: "Latest Admit Cards 2026 | Daksh Rojgar",
        seoDescription: "Download latest admit cards, exam hall tickets and recruitment examination updates from Daksh Rojgar.",
        endpoint: "/api/posts?category=admit_card",
        type: "post",
    },

    result: {
        title: "Exam Results",
        label: "LATEST RESULTS",
        description: "Check the latest recruitment and examination results.",
        seoTitle: "Latest Exam Results 2026 | Daksh Rojgar",
        seoDescription: "Check latest government job results, recruitment results, exam results and merit list updates on Daksh Rojgar.",
        endpoint: "/api/posts?category=result",
        type: "post",
    },

    answer_key: {
        title: "Answer Keys",
        label: "LATEST ANSWER KEYS",
        description: "Latest provisional and final answer keys.",
        seoTitle: "Latest Answer Keys 2026 | Daksh Rojgar",
        seoDescription: "Check latest provisional and final answer keys for government recruitment and competitive examinations on Daksh Rojgar.",
        endpoint: "/api/posts?category=answer_key",
        type: "post",
    },

    syllabus: {
        title: "Syllabus",
        label: "LATEST SYLLABUS",
        description: "Exam syllabus and preparation-related updates.",
        seoTitle: "Latest Exam Syllabus & Study Updates | Daksh Rojgar",
        seoDescription: "Find latest government exam syllabus, recruitment syllabus and useful study updates on Daksh Rojgar.",
        endpoint: "/api/posts?category=syllabus",
        type: "post",
    },

    current_affairs: {
        title: "Current Affairs",
        label: "DAILY CURRENT AFFAIRS",
        description: "Current affairs and useful study updates.",
        seoTitle: "Daily Current Affairs 2026 | Daksh Rojgar",
        seoDescription: "Read daily current affairs, Rajasthan current affairs and useful competitive exam updates on Daksh Rojgar.",
        endpoint: "/api/posts?category=current_affairs",
        type: "post",
    },

    yojana: {
        title: "Government Schemes",
        label: "LATEST GOVERNMENT SCHEMES",
        description: "Central and State Government scheme information.",
        seoTitle: "Government Schemes & Yojana Updates | Daksh Rojgar",
        seoDescription: "Find latest Rajasthan and Central Government schemes, yojana information, eligibility and important updates on Daksh Rojgar.",
        endpoint: "/api/posts?category=yojana",
        type: "post",
    },

    rajasthan_info: {
        title: "Rajasthan Information",
        label: "RAJASTHAN UPDATES",
        description: "Important Rajasthan information and updates.",
        seoTitle: "Rajasthan Information & Latest Updates | Daksh Rojgar",
        seoDescription: "Read important Rajasthan information, government updates and useful state-level information on Daksh Rojgar.",
        endpoint: "/api/posts?category=rajasthan_info",
        type: "post",
    },

    emitra: {
        title: "eMitra Updates",
        label: "LATEST EMITRA INFORMATION",
        description: "Important eMitra services and update information.",
        seoTitle: "eMitra Updates & Services | Daksh Rojgar",
        seoDescription: "Get latest Rajasthan eMitra service updates, useful information and important eMitra notices on Daksh Rojgar.",
        endpoint: "/api/posts?category=emitra",
        type: "post",
    },

    all_posts: {
        title: "All Updates",
        label: "LATEST POSTS",
        description: "All recent posts published through Daksh Rojgar.",
        seoTitle: "Latest Updates | Daksh Rojgar",
        seoDescription: "See all latest jobs, admit cards, results, current affairs, schemes and other updates published on Daksh Rojgar.",
        endpoint: "/api/posts",
        type: "post",
    },
};


/* =================================
   Fast Listing Cache
================================= */

const DAKSH_LISTING_CACHE_PREFIX =
    "daksh_listing_cache_v1:";

function getListingCache(moduleName) {
    try {
        const raw =
            localStorage.getItem(
                DAKSH_LISTING_CACHE_PREFIX +
                moduleName
            );

        if (!raw) {
            return null;
        }

        const parsed =
            JSON.parse(raw);

        if (
            !parsed ||
            !Array.isArray(parsed.data)
        ) {
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.warn(
            "[Daksh Website] Listing cache read failed:",
            error
        );

        return null;
    }
}

function saveListingCache(
    moduleName,
    items
) {
    try {
        localStorage.setItem(
            DAKSH_LISTING_CACHE_PREFIX +
            moduleName,
            JSON.stringify({
                data: items,
                savedAt: Date.now(),
            })
        );
    } catch (error) {
        console.warn(
            "[Daksh Website] Listing cache save failed:",
            error
        );
    }
}


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
            summary.length > 75
                ? `${summary.slice(0, 75)}...`
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
    let cachedItems = null;

    try {
        if (
            !listingContainer ||
            !listingTitle ||
            !listingLabel ||
            !listingDescription
        ) {
            throw new Error(
                "Required listing page elements are missing"
            );
        }

        const params =
            new URLSearchParams(
                window.location.search
            );

        const requestedModule =
            params.get("module") ||
            "all_posts";

        const moduleName =
            MODULE_CONFIG[requestedModule]
                ? requestedModule
                : "all_posts";

        const config =
            MODULE_CONFIG[moduleName];

        listingTitle.textContent =
            config.title;

        listingLabel.textContent =
            config.label;

        listingDescription.textContent =
            config.description;

        document.title =
            config.seoTitle ||
            `${config.title} | Daksh Rojgar`;

        const pageDescription =
            document.getElementById(
                "pageDescription"
            );

        if (pageDescription) {
            pageDescription.setAttribute(
                "content",
                config.seoDescription ||
                config.description
            );
        }

        const pageCanonical =
            document.getElementById(
                "pageCanonical"
            );

        if (pageCanonical) {
            pageCanonical.setAttribute(
                "href",
                `${PUBLIC_SITE_URL}/listing.html?module=${encodeURIComponent(moduleName)}`
            );
        }

        /*
         * Show cached listing immediately.
         */
        cachedItems =
            getListingCache(
                moduleName
            );

        if (
            Array.isArray(cachedItems)
        ) {
            renderItems(
                cachedItems,
                config.type
            );

            console.log(
                `[Daksh Website] ${moduleName}: ${cachedItems.length} cached items shown instantly`
            );
        }

        /*
         * Refresh from backend in background.
         */
        const requestUrl =
            `${API_BASE_URL}${config.endpoint}`;

        console.log(
            "[Daksh Website] Listing refresh:",
            requestUrl
        );

        const response =
            await fetch(
                requestUrl,
                {
                    method: "GET",
                    mode: "cors",
                    cache: "default",
                    headers: {
                        Accept:
                            "application/json",
                    },
                }
            );

        if (!response.ok) {
            throw new Error(
                `API request failed with status ${response.status}`
            );
        }

        const items =
            await response.json();

        if (!Array.isArray(items)) {
            throw new Error(
                "API response is not an array"
            );
        }

        saveListingCache(
            moduleName,
            items
        );

        renderItems(
            items,
            config.type
        );

        console.log(
            `[Daksh Website] ${moduleName}: ${items.length} fresh items loaded`
        );

    } catch (error) {

        console.error(
            "[Daksh Website] Listing failed:",
            error
        );

        /*
         * If cache is already visible,
         * do not replace it with an error.
         */
        if (
            Array.isArray(cachedItems)
        ) {
            console.log(
                "[Daksh Website] Keeping cached listing visible"
            );

            return;
        }

        showLoadError(error);
    }
}
loadListing();


