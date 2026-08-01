"use strict";

const API_BASE_URL =
    "https://daksh-rojgar-api.onrender.com";

/* =================================
   Basic Page Setup
================================= */

const yearElement =
    document.getElementById("year");

if (yearElement) {
    yearElement.textContent =
        new Date().getFullYear();
}

const menuButton =
    document.getElementById("menuBtn");

const mainNavigation =
    document.getElementById("mainNav");

if (menuButton && mainNavigation) {
    menuButton.addEventListener(
        "click",
        () => {
            mainNavigation.classList.toggle(
                "open"
            );
        }
    );
}

/* =================================
   Utility Functions
================================= */

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getItemDate(item) {
    const value =
        item.updated_at ||
        item.created_at ||
        item.post_date;

    const parsedDate =
        new Date(value || 0);

    return Number.isNaN(
        parsedDate.getTime()
    )
        ? new Date(0)
        : parsedDate;
}

function getItemTitle(item) {
    return (
        item.title_hi ||
        item.title ||
        "Latest Update"
    );
}

function makeAbsoluteBackendUrl(url) {
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

function getItemDestination(item) {
    /*
     * Post:
     * Website के post detail page पर खुलेगा.
     */
    if (
        item.source_type === "post" &&
        item.id
    ) {
        return {
            url: `post.html?id=${encodeURIComponent(
                item.id
            )}`,
            external: false,
        };
    }

    /*
     * Job:
     * अभी website job detail page नहीं बना है.
     * इसलिए पहले available external link खोलेंगे.
     */
    if (
        item.source_type === "job"
    ) {
        const jobUrl =
            item.apply_link ||
            item.official_website ||
            item.download_notification_link ||
            item.pdf_url ||
            "";

        if (jobUrl) {
            return {
                url: makeAbsoluteBackendUrl(
                    jobUrl
                ),
                external: true,
            };
        }
    }

    return {
        url: "#",
        external: false,
    };
}

/* =================================
   Fetch Jobs and Posts
================================= */

async function fetchLiveContent() {
    const [
        jobsResponse,
        postsResponse,
    ] = await Promise.all([
        fetch(
            `${API_BASE_URL}/api/jobs`,
            {
                headers: {
                    Accept:
                        "application/json",
                },
            }
        ),

        fetch(
            `${API_BASE_URL}/api/posts`,
            {
                headers: {
                    Accept:
                        "application/json",
                },
            }
        ),
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

    const jobsData =
        await jobsResponse.json();

    const postsData =
        await postsResponse.json();

    const jobs =
        Array.isArray(jobsData)
            ? jobsData.map(
                  (item) => ({
                      ...item,
                      source_type:
                          "job",
                  })
              )
            : [];

    const posts =
        Array.isArray(postsData)
            ? postsData.map(
                  (item) => ({
                      ...item,
                      source_type:
                          "post",
                  })
              )
            : [];

    return [
        ...jobs,
        ...posts,
    ].sort(
        (
            firstItem,
            secondItem
        ) =>
            getItemDate(secondItem) -
            getItemDate(firstItem)
    );
}

/* =================================
   Latest Updates Ticker
================================= */

function renderLatestUpdates(items) {
    const ticker =
        document.querySelector(
            ".ticker"
        );

    if (!ticker) {
        return;
    }

    const latestItems =
        items
            .filter(
                (item) =>
                    item.title ||
                    item.title_hi
            )
            .slice(0, 3);

    if (
        latestItems.length === 0
    ) {
        ticker.innerHTML = `
            <strong>
                LATEST UPDATES
            </strong>

            <span>
                No live updates available
            </span>

            <a
                href="#"
                id="viewAllUpdates"
            >
                View All →
            </a>
        `;

        return;
    }

    const updateLinks =
        latestItems
            .map((item) => {
                const title =
                    getItemTitle(item);

                const destination =
                    getItemDestination(item);

                const target =
                    destination.external
                        ? ' target="_blank" rel="noopener noreferrer"'
                        : "";

                return `
                    <a
                        href="${escapeHtml(
                            destination.url
                        )}"${target}
                    >
                        ${escapeHtml(
                            title
                        )}
                        <em>New</em>
                    </a>
                `;
            })
            .join("");

    ticker.innerHTML = `
        <strong>
            LATEST UPDATES
        </strong>

        ${updateLinks}

        <a
            href="#"
            id="viewAllUpdates"
        >
            View All →
        </a>
    `;

    const viewAllButton =
        document.getElementById(
            "viewAllUpdates"
        );

    if (viewAllButton) {
        viewAllButton.addEventListener(
            "click",
            (event) => {
                event.preventDefault();

                document
                    .querySelector(
                        ".cards"
                    )
                    ?.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start",
                    });
            }
        );
    }
}

/* =================================
   Search
================================= */

let allLiveItems = [];

const searchForm =
    document.getElementById(
        "searchForm"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

if (
    searchForm &&
    searchInput
) {
    searchForm.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const rawQuery =
                searchInput.value.trim();

            const query =
                rawQuery.toLowerCase();

            if (!query) {
                searchInput.focus();
                return;
            }

            const matches =
                allLiveItems.filter(
                    (item) => {
                        const searchableText =
                            [
                                item.title,
                                item.title_hi,
                                item.description,
                                item.description_hi,
                                item.content,
                                item.content_hi,
                                item.category,
                                item.organization,
                                item.organization_hi,
                                item.state,
                                item.type,
                            ]
                                .filter(
                                    Boolean
                                )
                                .join(" ")
                                .toLowerCase();

                        return searchableText.includes(
                            query
                        );
                    }
                );

            if (
                matches.length === 0
            ) {
                alert(
                    `“${rawQuery}” के लिए कोई update नहीं मिला।`
                );

                return;
            }

            renderLatestUpdates(
                matches
            );

            document
                .querySelector(
                    ".ticker"
                )
                ?.scrollIntoView({
                    behavior:
                        "smooth",
                    block:
                        "center",
                });
        }
    );
}

/* =================================
   Start Website API Integration
================================= */

async function initializeWebsite() {
    try {
        console.log(
            "[Daksh Website] Loading live updates..."
        );

        allLiveItems =
            await fetchLiveContent();

        console.log(
            `[Daksh Website] ${allLiveItems.length} live items loaded`
        );

        renderLatestUpdates(
            allLiveItems
        );
    } catch (error) {
        console.error(
            "[Daksh Website] API connection failed:",
            error
        );

        /*
         * API fail होने पर index.html में मौजूद
         * static ticker दिखाई देती रहेगी।
         */
    }
}

initializeWebsite();