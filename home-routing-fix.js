"use strict";

(() => {
    const API_BASE_URL = "https://daksh-rojgar-api.onrender.com";
    let jobMap = new Map();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("site-fixes-sw.js?v=20260911", { scope: "./" })
            .catch((error) => {
                console.warn("[Daksh Site] Service worker registration failed", error);
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
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    loadJobs();
})();
