"use strict";

(() => {
    const oldGenerate = document.getElementById("generateResizePdf");
    const oldDownload = document.getElementById("downloadResizePdf");
    const input = document.getElementById("pdfMainInput");
    const targetSelect = document.getElementById("resizePdfTarget");
    const customInput = document.getElementById("resizePdfCustomKb");
    const qualitySelect = document.getElementById("resizePdfQuality");
    const info = document.getElementById("resizePdfInfo");
    const status = document.getElementById("pdfStatus");
    const progress = document.getElementById("resizePdfProgress");
    const progressBar = document.getElementById("resizePdfProgressBar");
    const progressText = document.getElementById("resizePdfProgressText");

    if (!oldGenerate || !oldDownload || !input || !window.pdfjsLib || !window.PDFLib) {
        return;
    }

    const generate = oldGenerate.cloneNode(true);
    const download = oldDownload.cloneNode(true);
    oldGenerate.replaceWith(generate);
    oldDownload.replaceWith(download);

    let outputBytes = null;
    let outputName = "daksh-resized.pdf";

    function selectedPdf() {
        const files = Array.from(input.files || []);
        return files.find((file) => file.type === "application/pdf") || null;
    }

    function targetKb() {
        if (targetSelect?.value === "custom") {
            return Math.max(0, Number(customInput?.value || 0));
        }
        return Math.max(0, Number(targetSelect?.value || 0));
    }

    function setProgress(percent, text) {
        if (progress) progress.hidden = false;
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressText) progressText.textContent = text;
    }

    async function canvasToJpeg(canvas, quality) {
        return await new Promise((resolve, reject) => {
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    reject(new Error("JPEG conversion failed"));
                    return;
                }
                resolve(new Uint8Array(await blob.arrayBuffer()));
            }, "image/jpeg", quality);
        });
    }

    async function rasterizePdf(sourceBytes, scale, jpegQuality) {
        const pdf = await pdfjsLib.getDocument({ data: sourceBytes.slice(0) }).promise;
        const out = await PDFLib.PDFDocument.create();

        for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
            setProgress(
                12 + Math.round((pageNo / pdf.numPages) * 68),
                `Processing page ${pageNo} of ${pdf.numPages}...`
            );

            const page = await pdf.getPage(pageNo);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(viewport.width));
            canvas.height = Math.max(1, Math.round(viewport.height));

            const ctx = canvas.getContext("2d", { alpha: false });
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            await page.render({ canvasContext: ctx, viewport }).promise;

            const jpg = await canvasToJpeg(canvas, jpegQuality);
            const image = await out.embedJpg(jpg);
            const pageWidth = page.view[2] - page.view[0];
            const pageHeight = page.view[3] - page.view[1];
            const outPage = out.addPage([pageWidth, pageHeight]);
            outPage.drawImage(image, {
                x: 0,
                y: 0,
                width: pageWidth,
                height: pageHeight
            });
        }

        return new Uint8Array(await out.save({ useObjectStreams: true }));
    }

    async function makeRealCompressedPdf(file, wantedKb) {
        const source = new Uint8Array(await file.arrayBuffer());
        const targetBytes = wantedKb * 1024;

        if (source.length <= targetBytes) {
            return {
                bytes: source.slice(),
                originalSize: source.length,
                exactTargetReached: true,
                unchanged: true
            };
        }

        let baseScale = 1.35;
        let baseQuality = 0.78;

        if (qualitySelect?.value === "high") {
            baseScale = 1.6;
            baseQuality = 0.88;
        } else if (qualitySelect?.value === "small") {
            baseScale = 1.05;
            baseQuality = 0.58;
        }

        const attempts = [
            [baseScale, baseQuality],
            [baseScale * 0.86, Math.max(0.62, baseQuality - 0.10)],
            [baseScale * 0.72, Math.max(0.52, baseQuality - 0.18)],
            [baseScale * 0.58, 0.46],
            [baseScale * 0.46, 0.38],
            [baseScale * 0.36, 0.30],
            [baseScale * 0.28, 0.24]
        ];

        let bestUnder = null;
        let smallest = null;

        for (let i = 0; i < attempts.length; i++) {
            setProgress(8 + Math.round((i / attempts.length) * 15), `Compression attempt ${i + 1}/${attempts.length}...`);
            const [scale, quality] = attempts[i];
            const candidate = await rasterizePdf(source, scale, quality);

            if (!smallest || candidate.length < smallest.length) {
                smallest = candidate;
            }

            if (candidate.length <= targetBytes) {
                if (!bestUnder || candidate.length > bestUnder.length) {
                    bestUnder = candidate;
                }
                if (candidate.length >= targetBytes * 0.82) break;
            }
        }

        let chosen = bestUnder || smallest;
        if (!chosen || chosen.length >= source.length) {
            chosen = source.slice();
        }

        return {
            bytes: chosen,
            originalSize: source.length,
            exactTargetReached: chosen.length <= targetBytes,
            unchanged: chosen.length === source.length
        };
    }

    input.addEventListener("change", () => {
        outputBytes = null;
        download.disabled = true;
        generate.disabled = !selectedPdf();
    });

    targetSelect?.addEventListener("change", () => {
        outputBytes = null;
        download.disabled = true;
    });

    customInput?.addEventListener("input", () => {
        outputBytes = null;
        download.disabled = true;
    });

    generate.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const file = selectedPdf();
        const wantedKb = targetKb();

        if (!file) {
            if (status) status.textContent = "Please select a PDF first.";
            return;
        }

        if (!wantedKb || wantedKb < 20) {
            if (status) status.textContent = "Please enter a valid target KB.";
            return;
        }

        generate.disabled = true;
        download.disabled = true;
        outputBytes = null;
        generate.textContent = "Processing...";
        setProgress(5, "Preparing PDF...");

        try {
            const result = await makeRealCompressedPdf(file, wantedKb);
            outputBytes = result.bytes;
            outputName = `${file.name.replace(/\.pdf$/i, "")}-resized.pdf`;

            const originalKb = result.originalSize / 1024;
            const actualKb = outputBytes.length / 1024;
            const reducedBy = Math.max(0, 100 - (outputBytes.length / result.originalSize) * 100);

            setProgress(100, "Processing complete.");

            if (result.unchanged && result.originalSize <= wantedKb * 1024) {
                if (info) info.textContent = `Already under ${wantedKb} KB | Original: ${originalKb.toFixed(1)} KB | Output: ${actualKb.toFixed(1)} KB`;
                if (status) status.textContent = "No compression was required.";
            } else if (result.exactTargetReached) {
                if (info) info.textContent = `Original: ${originalKb.toFixed(1)} KB | Actual output: ${actualKb.toFixed(1)} KB | Reduced: ${reducedBy.toFixed(1)}%`;
                if (status) status.textContent = `PDF really compressed to ${actualKb.toFixed(1)} KB.`;
            } else if (!result.unchanged) {
                if (info) info.textContent = `Target: ${wantedKb} KB | Original: ${originalKb.toFixed(1)} KB | Actual output: ${actualKb.toFixed(1)} KB`;
                if (status) status.textContent = "PDF size was reduced, but the selected target could not be reached safely.";
            } else {
                if (info) info.textContent = `Original: ${originalKb.toFixed(1)} KB | Output remained: ${actualKb.toFixed(1)} KB`;
                if (status) status.textContent = "This PDF could not be reduced further in the browser.";
            }

            download.disabled = false;
        } catch (error) {
            console.error("[Daksh PDF Resize Real Fix]", error);
            outputBytes = null;
            download.disabled = true;
            if (info) info.textContent = "Unable to resize this PDF.";
            if (status) status.textContent = "PDF resize failed.";
        } finally {
            generate.disabled = false;
            generate.textContent = "Resize PDF";
            setTimeout(() => {
                if (progress) progress.hidden = true;
                if (progressBar) progressBar.style.width = "0%";
            }, 1000);
        }
    }, true);

    download.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!outputBytes) return;

        const blob = new Blob([outputBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = outputName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, true);
})();
