"use strict";

(() => {
    const API_BASE_URL = "https://daksh-rojgar-api.onrender.com";
    let jobMap = new Map();

    const addRajasthanInfoLinks = () => {
        const nav = document.getElementById("mainNav");
        if (nav && !nav.querySelector('a[href="listing.html?module=rajasthan_info"]')) {
            const link = document.createElement("a");
            link.href = "listing.html?module=rajasthan_info";
            link.textContent = "Rajasthan Info";

            const photoLink = nav.querySelector('a[href*="photo-"]');
            if (photoLink) nav.insertBefore(link, photoLink);
            else nav.appendChild(link);
        }

        document.querySelectorAll(".dr-footer-inner > div").forEach((section) => {
            const heading = section.querySelector("h4");
            if (!heading || heading.textContent.trim() !== "Resources") return;
            if (section.querySelector('a[href="listing.html?module=rajasthan_info"]')) return;

            const link = document.createElement("a");
            link.href = "listing.html?module=rajasthan_info";
            link.textContent = "Rajasthan Info";

            const photoLink = section.querySelector('a[href*="photo-"]');
            if (photoLink) section.insertBefore(link, photoLink);
            else section.appendChild(link);
        });
    };

    addRajasthanInfoLinks();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("site-fixes-sw.js?v=20260911", { scope: "./" })
            .catch((error) => {
                console.warn("[Daksh Site] Service worker registration failed", error);
            });

        document.addEventListener("click", async (event) => {
            const anchor = event.target.closest('a[href^="pdf-workbench.html"]');
            if (!anchor || navigator.serviceWorker.controller) return;

            event.preventDefault();
            const destination = anchor.href;

            try {
                await navigator.serviceWorker.ready;
                await new Promise((resolve) => setTimeout(resolve, 150));
            } catch (_) {
                // Navigation should still continue even if registration is delayed.
            }

            window.location.href = destination;
        });
    }

    const normalize = (value) =>
        String(value || "")
            .replace(/\bnew\b/gi, " ")
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

    async function loadJobs() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs`, {
                headers: { Accept: "application/json" }
            });
            if (!response.ok) return;

            const jobs = await response.json();
            if (!Array.isArray(jobs)) return;

            jobMap = new Map();
            jobs.forEach((job) => {
                const id = job?.id;
                if (!id) return;

                [job.title_hi, job.title]
                    .filter(Boolean)
                    .forEach((title) => {
                        jobMap.set(normalize(title), id);
                    });
            });

            repairHomeJobLinks();
        } catch (error) {
            console.warn("[Daksh Home] Job detail routing fix could not load jobs", error);
        }
    }

    function findJobIdFromAnchor(anchor) {
        const rawText = anchor.textContent || "";
        const key = normalize(rawText);
        if (jobMap.has(key)) return jobMap.get(key);

        for (const [title, id] of jobMap.entries()) {
            if (key.includes(title) || title.includes(key)) {
                return id;
            }
        }

        return null;
    }

    function repairHomeJobLinks() {
        const anchors = document.querySelectorAll(
            '.dr-panel[data-home-module="jobs"] a, .dr-ticker a'
        );

        anchors.forEach((anchor) => {
            if (anchor.id === "viewAllUpdates") return;

            const id = findJobIdFromAnchor(anchor);
            if (!id) return;

            anchor.href = `job.html?id=${encodeURIComponent(id)}`;
            anchor.removeAttribute("target");
            anchor.removeAttribute("rel");
        });
    }

    const observer = new MutationObserver(() => {
        repairHomeJobLinks();
        addRajasthanInfoLinks();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    loadJobs();
})();
