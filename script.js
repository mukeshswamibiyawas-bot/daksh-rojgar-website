"use strict";

const API_BASE_URL = "https://daksh-rojgar-api.onrender.com";

/* ---------------------------------
   Basic page setup
---------------------------------- */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const menuButton = document.getElementById("menuBtn");
const mainNavigation = document.getElementById("mainNav");

if (menuButton && mainNavigation) {
    menuButton.addEventListener("click", () => {
        mainNavigation.classList.toggle("open");
    });
}

/* ---------------------------------
   Utility functions
---------------------------------- */

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
        return "#";
    }

    if (
        url.startsWith("https://") ||
        url.startsWith("http://")
    ) {
        return url;
    }

    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function getItemDate(item) {
    const value =
        item.updated_at ||
        item.created_at ||
        item.post_date;

    const parsedDate = new Date(value || 0);

    return Number.isNaN(parsedDate.getTime())
        ? new Date(0)
        : parsedDate;
}

function getItemLink(item) {
    return (
        item.apply_link ||
        item.official_website ||
        item.download_link ||
        item.download_admit_card_link ||
        item.download_result_link ||
        item.pdf_url ||
        "#"
    );
}

/* ---------------------------------
   Fetch live content
---------------------------------- */

async function fetchLiveContent() {
    const [jobsResponse, postsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/jobs`, {
            headers: {
                Accept: "application/json",
            },
        }),

        fetch(`${API_BASE_URL}/api/posts`, {
            headers: {
                Accept: "application/json",
            },
        }),
    ]);

    if (!jobsResponse.ok) {
        throw new Error(
            `Jobs API failed: ${jobsResponse.status}`
        );
    }

    if (!postsResponse.ok) {
        throw new Error(
            `Posts API failed: ${postsResponse.status}`
        );
    }

    const jobsData = await jobsResponse.json();
    const postsData = await postsResponse.json();

    const jobs = Array.isArray(jobsData)
        ? jobsData.map((item) => ({
              ...item,
              source_type: "job",
          }))
        : [];

    const posts = Array.isArray(postsData)
        ? postsData.map((item) => ({
              ...item,
              source_type: "post",
          }))
        : [];

    return [...jobs, ...posts].sort(
        (firstItem, secondItem) =>
            getItemDate(secondItem) -
            getItemDate(firstItem)
    );
}

/* ---------------------------------
   Latest Updates ticker
---------------------------------- */

function renderLatestUpdates(items) {
    const ticker = document.querySelector(".ticker");

    if (!ticker) {
        return;
    }

    const latestItems = items
        .filter((item) => item.title || item.title_hi)
        .slice(0, 3);

    if (latestItems.length === 0) {
        return;
    }

    const updateLinks = latestItems
        .map((item) => {
            const title =
                item.title_hi ||
                item.title ||
                "Latest Update";

            const destination = makeAbsoluteUrl(
                getItemLink(item)
            );

            const target =
                destination === "#"
                    ? ""
                    : ' target="_blank" rel="noopener noreferrer"';

            return `
                <a href="${escapeHtml(destination)}"${target}>
                    ${escapeHtml(title)}
                    <em>New</em>
                </a>
            `;
        })
        .join("");

    ticker.innerHTML = `
        <strong>LATEST UPDATES</strong>
        ${updateLinks}
        <a href="#" id="viewAllUpdates">
            View All →
        </a>
    `;

    const viewAllButton =
        document.getElementById("viewAllUpdates");

    if (viewAllButton) {
        viewAllButton.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                document
                    .querySelector(".cards")
                    ?.scrollIntoView({
                        behavior: "smooth",
                    });
            }
        );
    }
}

/* ---------------------------------
   Search
---------------------------------- */

let allLiveItems = [];

const searchForm =
    document.getElementById("searchForm");

const searchInput =
    document.getElementById("searchInput");

if (searchForm && searchInput) {
    searchForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            if (!query) {
                searchInput.focus();
                return;
            }

            const matches = allLiveItems.filter(
                (item) => {
                    const searchableText = [
                        item.title,
                        item.title_hi,
                        item.description,
                        item.description_hi,
                        item.content,
                        item.content_hi,
                        item.category,
                        item.organization,
                        item.state,
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();

                    return searchableText.includes(query);
                }
            );

            if (matches.length === 0) {
                alert(
                    `“${searchInput.value.trim()}” के लिए कोई update नहीं मिला।`
                );
                return;
            }

            renderLatestUpdates(matches);

            document
                .querySelector(".ticker")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
        }
    );
}

/* ---------------------------------
   Start website API integration
---------------------------------- */

async function initializeWebsite() {
    try {
        console.log(
            "[Daksh Website] Loading live updates..."
        );

        allLiveItems = await fetchLiveContent();

        renderLatestUpdates(allLiveItems);

        console.log(
            `[Daksh Website] ${allLiveItems.length} live items loaded`
        );
    } catch (error) {
        console.error(
            "[Daksh Website] API connection failed:",
            error
        );

        /*
         * API failure होने पर HTML में मौजूद
         * पुरानी static ticker दिखाई देती रहेगी।
         */
    }
}

initializeWebsite();
