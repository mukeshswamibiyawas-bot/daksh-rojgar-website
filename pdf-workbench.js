"use strict";

const yearElement =
    document.getElementById("year");

if (yearElement) {
    yearElement.textContent =
        new Date().getFullYear();
}

const pdfStatus =
    document.getElementById("pdfStatus");

const pdfActionButtons =
    document.querySelectorAll(
        "[data-pdf-action]"
    );

const mergePdfPanel =
    document.getElementById(
        "mergePdfPanel"
    );

const addMorePdfButton =
    document.getElementById(
        "addMorePdfButton"
    );

const sortPdfButton =
    document.getElementById(
        "sortPdfButton"
    );

const mergePdfInfo =
    document.getElementById(
        "mergePdfInfo"
    );

const mergePdfCards =
    document.getElementById(
        "mergePdfCards"
    );

const generateMergePdfButton =
    document.getElementById(
        "generateMergePdf"
    );

const downloadMergePdfButton =
    document.getElementById(
        "downloadMergePdf"
    );

const imageToPdfPanel =
    document.getElementById(
        "imageToPdfPanel"
    );

const splitPdfPanel =
    document.getElementById(
        "splitPdfPanel"
    );

const pdfMainInput =
    document.getElementById(
        "pdfMainInput"
    );

const pdfMainPreview =
    document.getElementById(
        "pdfMainPreview"
    );

const imageToPdfPageSize =
    document.getElementById(
        "imageToPdfPageSize"
    );

const imageToPdfFit =
    document.getElementById(
        "imageToPdfFit"
    );

const generateImagePdfButton =
    document.getElementById(
        "generateImagePdf"
    );

const downloadImagePdfButton =
    document.getElementById(
        "downloadImagePdf"
    );

const imageToPdfInfo =
    document.getElementById(
        "imageToPdfInfo"
    );

const imageToPdfList =
    document.getElementById(
        "imageToPdfList"
    );

let generatedPdfBytes = null;


/* ========================================
   TOOL SELECTION
======================================== */

pdfActionButtons.forEach((button) => {

    button.addEventListener(
        "click",
        () => {

            pdfActionButtons.forEach(
                (item) =>
                    item.classList.remove(
                        "active"
                    )
            );

            button.classList.add(
                "active"
            );

            const action =
                button.dataset.pdfAction;

            imageToPdfPanel.hidden =
                true;

            mergePdfPanel.hidden =
                true;

            if (splitPdfPanel) {
                splitPdfPanel.hidden = true;
            }


            if (
                action ===
                "image-to-pdf"
            ) {

                imageToPdfPanel.hidden =
                    false;

                /*
                 Images to PDF panel को
                 tool cards के ऊपर लाएँ,
                 बिल्कुल Remove Pages की तरह.
                */
                if (
                    pdfActionPanel &&
                    imageToPdfPanel &&
                    imageToPdfPanel.parentNode
                ) {

                    pdfActionPanel.parentNode.insertBefore(
                        imageToPdfPanel,
                        pdfActionPanel
                    );
                }

                pdfMainPreview.classList.remove(
                    "merge-preview-mode",
                    "split-preview-mode",
                    "resize-preview-mode",
                    "pdf-to-images-preview-mode",
                    "remove-pages-preview-mode",
                    "rotate-pages-preview-mode",
                    "reorder-pages-preview-mode"
                );

                pdfMainPreview.classList.add(
                    "images-to-pdf-preview-mode"
                );

                pdfStatus.textContent =
                    "Selected tool: Images to PDF";

                imageToPdfPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            } else if (
                action ===
                "merge"
            ) {

                mergePdfPanel.hidden =
                    false;

                pdfStatus.textContent =
                    "Selected tool: Merge PDF";

                mergePdfPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });

            } else if (
                action === "split"
            ) {

                if (splitPdfPanel) {
                    splitPdfPanel.hidden = false;

                    if (
                        pdfActionPanel &&
                        splitPdfPanel.parentNode
                    ) {
                        pdfActionPanel.parentNode.insertBefore(
                            splitPdfPanel,
                            pdfActionPanel
                        );
                    }

                    splitPdfPanel.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                }

                pdfStatus.textContent =
                    "Selected tool: Split PDF";

            } else if (
                action === "reorder"
            ) {

                pdfMainInput.accept =
                    "application/pdf";

                pdfMainInput.multiple =
                    false;

                if (imageToPdfPanel) {
                    imageToPdfPanel.hidden = true;
                }

                if (mergePdfPanel) {
                    mergePdfPanel.hidden = true;
                }

                if (splitPdfPanel) {
                    splitPdfPanel.hidden = true;
                }

                const resizePanel =
                    document.getElementById(
                        "resizePdfKbPanel"
                    );

                if (resizePanel) {
                    resizePanel.hidden = true;
                }

                const imagesPanel =
                    document.getElementById(
                        "pdfToImagesPanel"
                    );

                if (imagesPanel) {
                    imagesPanel.hidden = true;
                }

                const removePanel =
                    document.getElementById(
                        "removePagesPanel"
                    );

                if (removePanel) {
                    removePanel.hidden = true;
                }

                const rotatePanel =
                    document.getElementById(
                        "rotatePagesPanel"
                    );

                if (rotatePanel) {
                    rotatePanel.hidden = true;
                }

                if (
                    typeof reorderPagesPanel !==
                        "undefined" &&
                    reorderPagesPanel
                ) {

                    reorderPagesPanel.hidden =
                        false;

                    if (
                        pdfActionPanel &&
                        reorderPagesPanel.parentNode
                    ) {

                        pdfActionPanel.parentNode.insertBefore(
                            reorderPagesPanel,
                            pdfActionPanel
                        );
                    }
                }

                pdfStatus.textContent =
                    "Selected tool: Reorder Pages";

                if (
                    typeof reorderPagesFile !==
                        "undefined" &&
                    reorderPagesFile
                ) {

                    renderReorderPagesPreview();
                }

            } else {

                pdfStatus.textContent =
                    "Selected tool: " +
                    button.querySelector(
                        "strong"
                    ).textContent +
                    " — coming next.";
            }
        }
    );
});


/* ========================================
   IMAGE LIST
======================================== */


pdfMainInput.addEventListener(
    "change",
    () => {

        generatedPdfBytes =
            null;

        downloadImagePdfButton.disabled =
            true;

        imageToPdfList.innerHTML =
            "";

        const files =
            Array.from(
                pdfMainInput.files || []
            );

        if (!files.length) {

            imageToPdfInfo.textContent =
                "No files selected.";

            pdfMainPreview.innerHTML =
                "<span>File preview will appear here</span>";

            pdfStatus.textContent =
                "Select file(s) to begin.";

            return;
        }


        /*
         अभी Images to PDF tool के लिए
         JPG / PNG images preview करें.
        */

        const imageFiles =
            files.filter(
                (file) =>
                    file.type === "image/jpeg" ||
                    file.type === "image/png"
            );


        if (imageFiles.length) {

            imageToPdfInfo.textContent =
                `${imageFiles.length} image(s) selected.`;

            pdfStatus.textContent =
                `${imageFiles.length} image(s) ready for PDF.`;

            pdfMainPreview.innerHTML =
                "";

            const previewGrid =
                document.createElement(
                    "div"
                );

            previewGrid.className =
                "pdf-image-preview-grid";


            imageFiles.forEach(
                (file, index) => {

                    const card =
                        document.createElement(
                            "div"
                        );

                    card.className =
                        "pdf-image-preview-card";


                    const image =
                        document.createElement(
                            "img"
                        );

                    const objectUrl =
                        URL.createObjectURL(
                            file
                        );

                    image.src =
                        objectUrl;

                    image.alt =
                        `Selected image ${index + 1}`;

                    image.onload =
                        () => {
                            URL.revokeObjectURL(
                                objectUrl
                            );
                        };


                    const number =
                        document.createElement(
                            "span"
                        );

                    number.textContent =
                        index + 1;


                    card.appendChild(
                        image
                    );

                    card.appendChild(
                        number
                    );

                    previewGrid.appendChild(
                        card
                    );


                    const row =
                        document.createElement(
                            "div"
                        );

                    row.className =
                        "pdf-file-row";

                    row.textContent =
                        `${index + 1}. ${file.name}`;

                    imageToPdfList.appendChild(
                        row
                    );
                }
            );


            pdfMainPreview.appendChild(
                previewGrid
            );

            return;
        }


        /*
         PDF file select हुई है.
         अभी preview placeholder दिखाएँ.
         अगले PDF tools इसी selection को use करेंगे.
        */

        const pdfFiles =
            files.filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );

        if (pdfFiles.length) {

            pdfStatus.textContent =
                `${pdfFiles.length} PDF file(s) selected.`;

            imageToPdfInfo.textContent =
                "Select Images to PDF tool only for JPG / PNG files.";

            pdfMainPreview.innerHTML =
                "";

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "pdf-selected-file-summary";

            box.innerHTML =
                `<strong>${pdfFiles.length} PDF file(s) selected</strong>
                 <span>${pdfFiles.map(file => file.name).join("<br>")}</span>`;

            pdfMainPreview.appendChild(
                box
            );

            return;
        }


        pdfStatus.textContent =
            "Unsupported file type selected.";
    }
);


/* ========================================
   IMAGES TO PDF
======================================== */

generateImagePdfButton.addEventListener(
    "click",
    async () => {

        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type === "image/jpeg" ||
                    file.type === "image/png"
            );

        if (!files.length) {

            pdfStatus.textContent =
                "Please select at least one image.";

            return;
        }

        generateImagePdfButton.disabled =
            true;

        downloadImagePdfButton.disabled =
            true;

        generateImagePdfButton.textContent =
            "Processing...";

        pdfStatus.textContent =
            "Creating PDF... Please wait.";

        try {

            const {
                PDFDocument
            } = PDFLib;

            const pdfDoc =
                await PDFDocument.create();

            for (
                const file of files
            ) {

                const bytes =
                    await file.arrayBuffer();

                let pdfImage;

                if (
                    file.type ===
                    "image/png"
                ) {

                    pdfImage =
                        await pdfDoc.embedPng(
                            bytes
                        );

                } else {

                    pdfImage =
                        await pdfDoc.embedJpg(
                            bytes
                        );
                }

                const imageWidth =
                    pdfImage.width;

                const imageHeight =
                    pdfImage.height;


                let pageWidth;
                let pageHeight;

                if (
                    imageToPdfPageSize.value ===
                    "a4"
                ) {

                    /*
                     A4 points:
                     595.28 × 841.89
                    */

                    pageWidth =
                        595.28;

                    pageHeight =
                        841.89;

                } else {

                    pageWidth =
                        imageWidth;

                    pageHeight =
                        imageHeight;
                }


                const page =
                    pdfDoc.addPage([
                        pageWidth,
                        pageHeight
                    ]);


                let scale;

                if (
                    imageToPdfFit.value ===
                    "fill"
                ) {

                    scale =
                        Math.max(
                            pageWidth /
                                imageWidth,
                            pageHeight /
                                imageHeight
                        );

                } else {

                    scale =
                        Math.min(
                            pageWidth /
                                imageWidth,
                            pageHeight /
                                imageHeight
                        );
                }


                const drawWidth =
                    imageWidth * scale;

                const drawHeight =
                    imageHeight * scale;

                const x =
                    (
                        pageWidth -
                        drawWidth
                    ) / 2;

                const y =
                    (
                        pageHeight -
                        drawHeight
                    ) / 2;


                page.drawImage(
                    pdfImage,
                    {
                        x,
                        y,
                        width:
                            drawWidth,
                        height:
                            drawHeight
                    }
                );
            }


            generatedPdfBytes =
                await pdfDoc.save();

            const sizeKb =
                generatedPdfBytes.length /
                1024;

            imageToPdfInfo.textContent =
                `${files.length} page PDF created | ` +
                `${sizeKb.toFixed(1)} KB`;

            pdfStatus.textContent =
                "PDF created successfully.";

            downloadImagePdfButton.disabled =
                false;

        } catch (error) {

            console.error(
                "[Daksh PDF Tools] Images to PDF failed:",
                error
            );

            pdfStatus.textContent =
                "Unable to create PDF.";

        } finally {

            generateImagePdfButton.disabled =
                false;

            generateImagePdfButton.textContent =
                "Create PDF";
        }
    }
);


/* ========================================
   DOWNLOAD PDF
======================================== */

downloadImagePdfButton.addEventListener(
    "click",
    () => {

        if (!generatedPdfBytes) {
            return;
        }

        const blob =
            new Blob(
                [generatedPdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "daksh-images-to-pdf.pdf";

        link.click();

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }
);




/* ========================================
   PROFESSIONAL MERGE PDF WORKSPACE
======================================== */

let activePdfTool =
    document.querySelector(
        "[data-pdf-action].active"
    )?.dataset.pdfAction ||
    "image-to-pdf";

let mergePdfFiles = [];
let mergedPdfBytes = null;


/*
 Hidden input केवल + button से
 नई PDFs जोड़ने के लिए.
*/

const mergeAddInput =
    document.createElement("input");

mergeAddInput.type =
    "file";

mergeAddInput.accept =
    "application/pdf";

mergeAddInput.multiple =
    true;

mergeAddInput.hidden =
    true;

document.body.appendChild(
    mergeAddInput
);


/*
 PDF.js worker
*/

if (
    window.pdfjsLib
) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}


/* ========================================
   ACTIVE TOOL
======================================== */

pdfActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                activePdfTool =
                    button.dataset.pdfAction;

                if (
                    activePdfTool === "merge"
                ) {

                    /*
                     Common Browse अब केवल PDF चुनेगा.
                    */

                    pdfMainInput.accept =
                        "application/pdf";

                    pdfMainInput.multiple =
                        true;

                    pdfMainPreview.classList.add(
                        "merge-preview-mode"
                    );


                    /*
                     Merge processing panel को
                     tool cards के ऊपर लाएँ.
                    */

                    if (
                        mergePdfPanel &&
                        pdfActionPanel
                    ) {

                        pdfActionPanel.parentNode.insertBefore(
                            mergePdfPanel,
                            pdfActionPanel
                        );
                    }


                    renderMergePdfPreview();

                } else {

                    pdfMainPreview.classList.remove(
                        "merge-preview-mode"
                    );

                    if (
                        activePdfTool ===
                        "image-to-pdf"
                    ) {

                        pdfMainInput.accept =
                            "image/jpeg,image/png";

                        pdfMainInput.multiple =
                            true;
                    }
                }
            }
        );
    }
);


/* ========================================
   COMMON BROWSE -> MERGE PDFs
======================================== */

pdfMainInput.addEventListener(
    "change",
    async () => {

        if (
            activePdfTool !== "merge"
        ) {
            return;
        }

        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );

        mergePdfFiles =
            files;

        mergedPdfBytes =
            null;

        downloadMergePdfButton.disabled =
            true;

        await renderMergePdfPreview();
    }
);


/* ========================================
   ADD MORE PDF
======================================== */

addMorePdfButton.addEventListener(
    "click",
    () => {

        mergeAddInput.value =
            "";

        mergeAddInput.click();
    }
);


mergeAddInput.addEventListener(
    "change",
    async () => {

        const files =
            Array.from(
                mergeAddInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );

        if (!files.length) {
            return;
        }


        /*
         Same file दोबारा accidental
         add न हो.
        */

        files.forEach(
            (file) => {

                const exists =
                    mergePdfFiles.some(
                        (existing) =>
                            existing.name === file.name &&
                            existing.size === file.size &&
                            existing.lastModified ===
                                file.lastModified
                    );

                if (!exists) {
                    mergePdfFiles.push(
                        file
                    );
                }
            }
        );


        mergedPdfBytes =
            null;

        downloadMergePdfButton.disabled =
            true;

        await renderMergePdfPreview();
    }
);


/* ========================================
   SORT PDF
======================================== */

sortPdfButton.addEventListener(
    "click",
    async () => {

        mergePdfFiles.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: "base"
                    }
                )
        );

        mergedPdfBytes =
            null;

        downloadMergePdfButton.disabled =
            true;

        await renderMergePdfPreview();
    }
);


/* ========================================
   FIRST PAGE THUMBNAIL
======================================== */

async function createPdfThumbnail(
    file,
    container
) {

    if (!window.pdfjsLib) {

        container.innerHTML =
            '<div class="merge-pdf-icon">📄</div>';

        return;
    }

    try {

        const bytes =
            await file.arrayBuffer();

        const pdf =
            await pdfjsLib.getDocument({
                data: bytes
            }).promise;

        const page =
            await pdf.getPage(1);

        const baseViewport =
            page.getViewport({
                scale: 1
            });

        const targetWidth =
            130;

        const scale =
            targetWidth /
            baseViewport.width;

        const viewport =
            page.getViewport({
                scale
            });

        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            Math.ceil(
                viewport.width
            );

        canvas.height =
            Math.ceil(
                viewport.height
            );

        const context =
            canvas.getContext(
                "2d"
            );

        await page.render({
            canvasContext:
                context,
            viewport
        }).promise;

        container.innerHTML =
            "";

        container.appendChild(
            canvas
        );

    } catch (error) {

        console.error(
            "[Daksh Merge] Thumbnail failed:",
            error
        );

        container.innerHTML =
            '<div class="merge-pdf-icon">📄</div>';
    }
}


/* ========================================
   RENDER MERGE PREVIEW
======================================== */

async function renderMergePdfPreview() {

    if (
        activePdfTool !== "merge"
    ) {
        return;
    }


    pdfMainPreview.innerHTML =
        "";

    pdfMainPreview.classList.add(
        "merge-preview-mode"
    );


    /*
     Floating actions
    */

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "merge-floating-actions";


    /*
     Existing buttons को preview में
     move करेंगे.
    */

    addMorePdfButton.textContent =
        "+";

    addMorePdfButton.title =
        "Add More PDFs";

    addMorePdfButton.classList.add(
        "merge-plus-button"
    );


    sortPdfButton.textContent =
        "A↕Z";

    sortPdfButton.title =
        "Sort PDFs";

    sortPdfButton.classList.add(
        "merge-sort-button"
    );


    actions.appendChild(
        addMorePdfButton
    );

    actions.appendChild(
        sortPdfButton
    );

    pdfMainPreview.appendChild(
        actions
    );


    if (!mergePdfFiles.length) {

        const empty =
            document.createElement(
                "div"
            );

        empty.className =
            "merge-empty-state";

        empty.innerHTML =
            "<strong>Select PDF files</strong>" +
            "<span>Use Browse or + button to add PDFs</span>";

        pdfMainPreview.appendChild(
            empty
        );

        mergePdfInfo.textContent =
            "No PDF files selected.";

        generateMergePdfButton.disabled =
            true;

        return;
    }


    generateMergePdfButton.disabled =
        false;


    const grid =
        document.createElement(
            "div"
        );

    grid.className =
        "merge-preview-grid";


    mergePdfFiles.forEach(
        (file, index) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "merge-preview-card";

            card.draggable =
                true;

            card.dataset.index =
                index;


            const thumbnail =
                document.createElement(
                    "div"
                );

            thumbnail.className =
                "merge-preview-thumbnail";


            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "merge-preview-name";

            name.textContent =
                file.name;


            const number =
                document.createElement(
                    "div"
                );

            number.className =
                "merge-preview-number";

            number.textContent =
                index + 1;


            const remove =
                document.createElement(
                    "button"
                );

            remove.type =
                "button";

            remove.className =
                "merge-remove-file";

            remove.textContent =
                "×";

            remove.title =
                "Remove PDF";


            remove.addEventListener(
                "click",
                async (event) => {

                    event.stopPropagation();

                    mergePdfFiles.splice(
                        index,
                        1
                    );

                    mergedPdfBytes =
                        null;

                    downloadMergePdfButton.disabled =
                        true;

                    await renderMergePdfPreview();
                }
            );


            card.appendChild(
                thumbnail
            );

            card.appendChild(
                name
            );

            card.appendChild(
                number
            );

            card.appendChild(
                remove
            );


            /*
             Drag reorder
            */

            card.addEventListener(
                "dragstart",
                (event) => {

                    event.dataTransfer.setData(
                        "text/plain",
                        String(index)
                    );

                    card.classList.add(
                        "dragging"
                    );
                }
            );


            card.addEventListener(
                "dragend",
                () => {

                    card.classList.remove(
                        "dragging"
                    );
                }
            );


            card.addEventListener(
                "dragover",
                (event) => {

                    event.preventDefault();
                }
            );


            card.addEventListener(
                "drop",
                async (event) => {

                    event.preventDefault();

                    const fromIndex =
                        Number(
                            event.dataTransfer.getData(
                                "text/plain"
                            )
                        );

                    const toIndex =
                        index;

                    if (
                        fromIndex ===
                        toIndex
                    ) {
                        return;
                    }

                    const moved =
                        mergePdfFiles.splice(
                            fromIndex,
                            1
                        )[0];

                    mergePdfFiles.splice(
                        toIndex,
                        0,
                        moved
                    );

                    mergedPdfBytes =
                        null;

                    downloadMergePdfButton.disabled =
                        true;

                    await renderMergePdfPreview();
                }
            );


            grid.appendChild(
                card
            );


            createPdfThumbnail(
                file,
                thumbnail
            );
        }
    );


    pdfMainPreview.appendChild(
        grid
    );


    const totalMb =
        mergePdfFiles.reduce(
            (sum, file) =>
                sum + file.size,
            0
        ) /
        1024 /
        1024;


    mergePdfInfo.textContent =
        `${mergePdfFiles.length} PDF file(s) selected | ` +
        `${totalMb.toFixed(2)} MB`;

    pdfStatus.textContent =
        `${mergePdfFiles.length} PDF file(s) ready to merge.`;
}


/* ========================================
   MERGE PDFs
======================================== */

generateMergePdfButton.addEventListener(
    "click",
    async () => {

        if (
            mergePdfFiles.length < 2
        ) {

            pdfStatus.textContent =
                "Please select at least 2 PDF files.";

            return;
        }


        generateMergePdfButton.disabled =
            true;

        downloadMergePdfButton.disabled =
            true;

        generateMergePdfButton.textContent =
            "Merging...";

        pdfStatus.textContent =
            "Merging PDF files... Please wait.";


        try {

            const {
                PDFDocument
            } = PDFLib;


            const mergedDocument =
                await PDFDocument.create();


            for (
                const file of
                mergePdfFiles
            ) {

                const bytes =
                    await file.arrayBuffer();

                const sourceDocument =
                    await PDFDocument.load(
                        bytes
                    );

                const pageIndices =
                    sourceDocument.getPageIndices();

                const copiedPages =
                    await mergedDocument.copyPages(
                        sourceDocument,
                        pageIndices
                    );


                copiedPages.forEach(
                    (page) => {

                        mergedDocument.addPage(
                            page
                        );
                    }
                );
            }


            mergedPdfBytes =
                await mergedDocument.save();


            const sizeKb =
                mergedPdfBytes.length /
                1024;


            mergePdfInfo.textContent =
                `${mergePdfFiles.length} PDFs merged successfully | ` +
                `${sizeKb.toFixed(1)} KB`;


            pdfStatus.textContent =
                "PDF merged successfully.";


            downloadMergePdfButton.disabled =
                false;


        } catch (error) {

            console.error(
                "[Daksh PDF Tools] Merge failed:",
                error
            );

            pdfStatus.textContent =
                "Unable to merge PDF files.";

        } finally {

            generateMergePdfButton.disabled =
                false;

            generateMergePdfButton.textContent =
                "Merge PDF";
        }
    }
);


/* ========================================
   DOWNLOAD MERGED PDF
======================================== */

downloadMergePdfButton.addEventListener(
    "click",
    () => {

        if (!mergedPdfBytes) {
            return;
        }


        const blob =
            new Blob(
                [mergedPdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "daksh-merged.pdf";

        link.click();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }
);




/* ========================================
   SPLIT PDF FUNCTION
======================================== */

const selectAllSplitPagesButton =
    document.getElementById(
        "selectAllSplitPages"
    );

const clearSplitPagesButton =
    document.getElementById(
        "clearSplitPages"
    );

const splitPdfInfo =
    document.getElementById(
        "splitPdfInfo"
    );

const splitPdfPreview =
    document.getElementById(
        "splitPdfPreview"
    );

const generateSplitPdfButton =
    document.getElementById(
        "generateSplitPdf"
    );

const downloadSplitPdfButton =
    document.getElementById(
        "downloadSplitPdf"
    );

let splitPdfFile = null;
let splitPdfBytes = null;
let splitPageCount = 0;
let selectedSplitPages = new Set();


/* ========================================
   SPLIT TOOL ACTIVATION
======================================== */

pdfActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            async () => {

                if (
                    button.dataset.pdfAction !==
                    "split"
                ) {
                    return;
                }

                activePdfTool =
                    "split";

                pdfMainInput.accept =
                    "application/pdf";

                pdfMainInput.multiple =
                    false;

                pdfMainPreview.classList.remove(
                    "merge-preview-mode"
                );

                if (
                    splitPdfPanel &&
                    pdfActionPanel
                ) {

                    pdfActionPanel.parentNode.insertBefore(
                        splitPdfPanel,
                        pdfActionPanel
                    );
                }

                splitPdfPanel.hidden =
                    false;

                imageToPdfPanel.hidden =
                    true;

                mergePdfPanel.hidden =
                    true;

                pdfStatus.textContent =
                    "Selected tool: Split PDF";

                if (splitPdfFile) {
                    await renderSplitPdfPages();
                }
            }
        );
    }
);


/* ========================================
   COMMON BROWSE -> SPLIT PDF
======================================== */

pdfMainInput.addEventListener(
    "change",
    async () => {

        if (
            activePdfTool !==
            "split"
        ) {
            return;
        }

        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );

        if (!files.length) {

            splitPdfFile =
                null;

            splitPdfPreview.innerHTML =
                "";

            splitPdfInfo.textContent =
                "Select a PDF file to view its pages.";

            generateSplitPdfButton.disabled =
                true;

            downloadSplitPdfButton.disabled =
                true;

            return;
        }

        splitPdfFile =
            files[0];

        splitPdfBytes =
            null;

        selectedSplitPages.clear();

        generateSplitPdfButton.disabled =
            true;

        downloadSplitPdfButton.disabled =
            true;

        pdfStatus.textContent =
            "Reading PDF pages...";

        await renderSplitPdfPages();
    }
);


/* ========================================
   RENDER SPLIT PAGES
======================================== */

async function renderSplitPdfPages() {

    if (!splitPdfFile) {
        return;
    }

    splitPdfPreview.innerHTML =
        "";

    pdfMainPreview.innerHTML =
        "";

    pdfMainPreview.classList.add(
        "split-preview-mode"
    );

    try {

        const bytes =
            await splitPdfFile.arrayBuffer();

        const pdf =
            await pdfjsLib.getDocument({
                data: bytes
            }).promise;

        splitPageCount =
            pdf.numPages;

        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "split-preview-grid";


        for (
            let pageNumber = 1;
            pageNumber <= splitPageCount;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(
                    pageNumber
                );

            const baseViewport =
                page.getViewport({
                    scale: 1
                });

            const targetWidth =
                125;

            const scale =
                targetWidth /
                baseViewport.width;

            const viewport =
                page.getViewport({
                    scale
                });

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "split-preview-card";

            card.dataset.page =
                String(pageNumber);


            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                Math.ceil(
                    viewport.width
                );

            canvas.height =
                Math.ceil(
                    viewport.height
                );

            const context =
                canvas.getContext(
                    "2d"
                );

            await page.render({
                canvasContext:
                    context,
                viewport
            }).promise;


            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "split-page-label";

            label.textContent =
                `Page ${pageNumber}`;


            const check =
                document.createElement(
                    "div"
                );

            check.className =
                "split-page-check";

            check.textContent =
                "✓";


            card.appendChild(
                canvas
            );

            card.appendChild(
                label
            );

            card.appendChild(
                check
            );


            card.addEventListener(
                "click",
                () => {

                    if (
                        selectedSplitPages.has(
                            pageNumber - 1
                        )
                    ) {

                        selectedSplitPages.delete(
                            pageNumber - 1
                        );

                        card.classList.remove(
                            "selected"
                        );

                    } else {

                        selectedSplitPages.add(
                            pageNumber - 1
                        );

                        card.classList.add(
                            "selected"
                        );
                    }

                    updateSplitSelectionInfo();
                }
            );


            grid.appendChild(
                card
            );
        }


        pdfMainPreview.appendChild(
            grid
        );

        splitPdfInfo.textContent =
            `${splitPageCount} page(s) found. Select pages to extract.`;

        pdfStatus.textContent =
            `PDF loaded successfully | ${splitPageCount} pages`;

    } catch (error) {

        console.error(
            "[Daksh PDF Tools] Split preview failed:",
            error
        );

        splitPdfInfo.textContent =
            "Unable to read PDF pages.";

        pdfStatus.textContent =
            "Unable to load PDF.";
    }
}


/* ========================================
   SPLIT SELECTION INFO
======================================== */

function updateSplitSelectionInfo() {

    const count =
        selectedSplitPages.size;

    splitPdfInfo.textContent =
        count
            ? `${count} page(s) selected out of ${splitPageCount}`
            : `${splitPageCount} page(s) found. Select pages to extract.`;

    generateSplitPdfButton.disabled =
        count === 0;

    splitPdfBytes =
        null;

    downloadSplitPdfButton.disabled =
        true;
}


/* ========================================
   SELECT ALL
======================================== */

selectAllSplitPagesButton.addEventListener(
    "click",
    () => {

        selectedSplitPages =
            new Set(
                Array.from(
                    {
                        length:
                            splitPageCount
                    },
                    (_, index) =>
                        index
                )
            );

        document.querySelectorAll(
            ".split-preview-card"
        ).forEach(
            (card) =>
                card.classList.add(
                    "selected"
                )
        );

        updateSplitSelectionInfo();
    }
);


/* ========================================
   CLEAR SELECTION
======================================== */

clearSplitPagesButton.addEventListener(
    "click",
    () => {

        selectedSplitPages.clear();

        document.querySelectorAll(
            ".split-preview-card"
        ).forEach(
            (card) =>
                card.classList.remove(
                    "selected"
                )
        );

        updateSplitSelectionInfo();
    }
);


/* ========================================
   EXTRACT SELECTED PAGES
======================================== */

generateSplitPdfButton.addEventListener(
    "click",
    async () => {

        if (
            !splitPdfFile ||
            !selectedSplitPages.size
        ) {

            pdfStatus.textContent =
                "Please select pages first.";

            return;
        }

        generateSplitPdfButton.disabled =
            true;

        downloadSplitPdfButton.disabled =
            true;

        generateSplitPdfButton.textContent =
            "Processing...";

        pdfStatus.textContent =
            "Extracting selected pages...";


        try {

            const {
                PDFDocument
            } = PDFLib;

            const sourceBytes =
                await splitPdfFile.arrayBuffer();

            const sourcePdf =
                await PDFDocument.load(
                    sourceBytes
                );

            const outputPdf =
                await PDFDocument.create();

            const pages =
                Array.from(
                    selectedSplitPages
                ).sort(
                    (a, b) =>
                        a - b
                );

            const copiedPages =
                await outputPdf.copyPages(
                    sourcePdf,
                    pages
                );

            copiedPages.forEach(
                (page) => {

                    outputPdf.addPage(
                        page
                    );
                }
            );

            splitPdfBytes =
                await outputPdf.save();

            const sizeKb =
                splitPdfBytes.length /
                1024;

            splitPdfInfo.textContent =
                `${pages.length} page(s) extracted | ` +
                `${sizeKb.toFixed(1)} KB`;

            pdfStatus.textContent =
                "Split PDF created successfully.";

            downloadSplitPdfButton.disabled =
                false;

        } catch (error) {

            console.error(
                "[Daksh PDF Tools] Split failed:",
                error
            );

            pdfStatus.textContent =
                "Unable to split PDF.";

        } finally {

            generateSplitPdfButton.disabled =
                false;

            generateSplitPdfButton.textContent =
                "Extract Selected Pages";
        }
    }
);


/* ========================================
   DOWNLOAD SPLIT PDF
======================================== */

downloadSplitPdfButton.addEventListener(
    "click",
    () => {

        if (!splitPdfBytes) {
            return;
        }

        const blob =
            new Blob(
                [splitPdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "daksh-split.pdf";

        link.click();

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }
);




/* ========================================
   RESIZE PDF IN KB
======================================== */

const resizePdfKbPanel =
    document.getElementById(
        "resizePdfKbPanel"
    );

const resizePdfOriginalSize =
    document.getElementById(
        "resizePdfOriginalSize"
    );

const resizePdfTargetDisplay =
    document.getElementById(
        "resizePdfTargetDisplay"
    );

const resizePdfTarget =
    document.getElementById(
        "resizePdfTarget"
    );

const resizePdfCustomKb =
    document.getElementById(
        "resizePdfCustomKb"
    );

const resizePdfQuality =
    document.getElementById(
        "resizePdfQuality"
    );

const resizePdfProgress =
    document.getElementById(
        "resizePdfProgress"
    );

const resizePdfProgressBar =
    document.getElementById(
        "resizePdfProgressBar"
    );

const resizePdfProgressText =
    document.getElementById(
        "resizePdfProgressText"
    );

const resizePdfInfo =
    document.getElementById(
        "resizePdfInfo"
    );

const generateResizePdfButton =
    document.getElementById(
        "generateResizePdf"
    );

const downloadResizePdfButton =
    document.getElementById(
        "downloadResizePdf"
    );

let resizePdfFile = null;
let resizedPdfBytes = null;
let resizePdfPageCount = 0;


/* ========================================
   TARGET KB
======================================== */

function getResizePdfTargetKb() {

    if (
        resizePdfTarget.value ===
        "custom"
    ) {

        const custom =
            Number(
                resizePdfCustomKb.value
            );

        return custom > 0
            ? custom
            : 0;
    }

    return Number(
        resizePdfTarget.value
    ) || 0;
}


function updateResizePdfTargetDisplay() {

    const target =
        getResizePdfTargetKb();

    resizePdfTargetDisplay.textContent =
        target
            ? `${target} KB`
            : "Enter Custom KB";
}


resizePdfTarget.addEventListener(
    "change",
    () => {

        const custom =
            resizePdfTarget.value ===
            "custom";

        resizePdfCustomKb.disabled =
            !custom;

        if (custom) {
            resizePdfCustomKb.focus();
        }

        updateResizePdfTargetDisplay();

        resizedPdfBytes =
            null;

        downloadResizePdfButton.disabled =
            true;
    }
);


resizePdfCustomKb.addEventListener(
    "input",
    () => {

        updateResizePdfTargetDisplay();

        resizedPdfBytes =
            null;

        downloadResizePdfButton.disabled =
            true;
    }
);


/* ========================================
   RESIZE TOOL ACTIVATION
======================================== */

pdfActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            async () => {

                if (
                    button.dataset.pdfAction !==
                    "resize-kb"
                ) {
                    return;
                }

                activePdfTool =
                    "resize-kb";

                pdfMainInput.accept =
                    "application/pdf";

                pdfMainInput.multiple =
                    false;

                imageToPdfPanel.hidden =
                    true;

                mergePdfPanel.hidden =
                    true;

                if (splitPdfPanel) {
                    splitPdfPanel.hidden =
                        true;
                }

                resizePdfKbPanel.hidden =
                    false;

                if (
                    pdfActionPanel &&
                    resizePdfKbPanel.parentNode
                ) {

                    pdfActionPanel.parentNode.insertBefore(
                        resizePdfKbPanel,
                        pdfActionPanel
                    );
                }

                pdfMainPreview.classList.remove(
                    "merge-preview-mode"
                );

                pdfMainPreview.classList.remove(
                    "split-preview-mode"
                );

                pdfStatus.textContent =
                    "Selected tool: Resize PDF in KB";

                if (resizePdfFile) {
                    await renderResizePdfPreview();
                }
            }
        );
    }
);


/* ========================================
   COMMON BROWSE -> RESIZE PDF
======================================== */

pdfMainInput.addEventListener(
    "change",
    async () => {

        if (
            activePdfTool !==
            "resize-kb"
        ) {
            return;
        }

        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );

        if (!files.length) {

            resizePdfFile =
                null;

            resizedPdfBytes =
                null;

            resizePdfOriginalSize.textContent =
                "Select a PDF file.";

            resizePdfInfo.textContent =
                "Select a PDF to begin.";

            generateResizePdfButton.disabled =
                true;

            downloadResizePdfButton.disabled =
                true;

            return;
        }

        resizePdfFile =
            files[0];

        resizedPdfBytes =
            null;

        resizePdfOriginalSize.textContent =
            `${(
                resizePdfFile.size /
                1024
            ).toFixed(1)} KB`;

        generateResizePdfButton.disabled =
            false;

        downloadResizePdfButton.disabled =
            true;

        resizePdfInfo.textContent =
            "PDF loaded. Choose target KB and resize.";

        pdfStatus.textContent =
            "PDF loaded successfully.";

        await renderResizePdfPreview();
    }
);


/* ========================================
   RESIZE PDF PREVIEW
======================================== */

async function renderResizePdfPreview() {

    if (!resizePdfFile) {
        return;
    }

    pdfMainPreview.innerHTML =
        "";

    pdfMainPreview.classList.add(
        "resize-preview-mode"
    );

    try {

        const bytes =
            await resizePdfFile.arrayBuffer();

        const pdf =
            await pdfjsLib.getDocument({
                data: bytes
            }).promise;

        resizePdfPageCount =
            pdf.numPages;

        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "resize-preview-grid";


        for (
            let pageNumber = 1;
            pageNumber <= resizePdfPageCount;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(
                    pageNumber
                );

            const baseViewport =
                page.getViewport({
                    scale: 1
                });

            const targetWidth =
                120;

            const scale =
                targetWidth /
                baseViewport.width;

            const viewport =
                page.getViewport({
                    scale
                });

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "resize-preview-card";


            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                Math.ceil(
                    viewport.width
                );

            canvas.height =
                Math.ceil(
                    viewport.height
                );

            const context =
                canvas.getContext(
                    "2d"
                );

            await page.render({
                canvasContext:
                    context,
                viewport
            }).promise;


            const label =
                document.createElement(
                    "div"
                );

            label.textContent =
                `Page ${pageNumber}`;

            label.className =
                "resize-page-label";


            card.appendChild(
                canvas
            );

            card.appendChild(
                label
            );

            grid.appendChild(
                card
            );
        }


        pdfMainPreview.appendChild(
            grid
        );

        pdfStatus.textContent =
            `PDF loaded successfully | ${resizePdfPageCount} pages`;

    } catch (error) {

        console.error(
            "[Daksh PDF Tools] Resize preview failed:",
            error
        );

        pdfStatus.textContent =
            "Unable to preview PDF.";
    }
}


/* ========================================
   CANVAS -> JPEG BYTES
======================================== */

function canvasToJpegBytes(
    canvas,
    quality
) {

    return new Promise(
        (resolve, reject) => {

            canvas.toBlob(
                async (blob) => {

                    if (!blob) {
                        reject(
                            new Error(
                                "JPEG conversion failed."
                            )
                        );
                        return;
                    }

                    resolve(
                        new Uint8Array(
                            await blob.arrayBuffer()
                        )
                    );
                },
                "image/jpeg",
                quality
            );
        }
    );
}


/* ========================================
   BUILD RASTERIZED PDF
======================================== */

async function buildRasterizedPdf(
    sourceBytes,
    renderScale,
    jpegQuality
) {

    const {
        PDFDocument
    } = PDFLib;

    const sourcePdf =
        await pdfjsLib.getDocument({
            data: sourceBytes.slice(0)
        }).promise;

    const outputPdf =
        await PDFDocument.create();


    for (
        let pageNumber = 1;
        pageNumber <= sourcePdf.numPages;
        pageNumber++
    ) {

        resizePdfProgressText.textContent =
            `Processing page ${pageNumber} of ${sourcePdf.numPages}...`;

        resizePdfProgressBar.style.width =
            `${
                Math.round(
                    pageNumber /
                    sourcePdf.numPages *
                    70
                )
            }%`;


        const page =
            await sourcePdf.getPage(
                pageNumber
            );

        const viewport =
            page.getViewport({
                scale:
                    renderScale
            });


        const canvas =
            document.createElement(
                "canvas"
            );

        canvas.width =
            Math.max(
                1,
                Math.round(
                    viewport.width
                )
            );

        canvas.height =
            Math.max(
                1,
                Math.round(
                    viewport.height
                )
            );


        const context =
            canvas.getContext(
                "2d",
                {
                    alpha: false
                }
            );

        context.fillStyle =
            "#ffffff";

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        await page.render({
            canvasContext:
                context,
            viewport
        }).promise;


        const jpegBytes =
            await canvasToJpegBytes(
                canvas,
                jpegQuality
            );


        const image =
            await outputPdf.embedJpg(
                jpegBytes
            );


        /*
         PDF page का original aspect ratio preserve रखें.
        */

        const pageWidth =
            page.view[2] -
            page.view[0];

        const pageHeight =
            page.view[3] -
            page.view[1];


        const outputPage =
            outputPdf.addPage([
                pageWidth,
                pageHeight
            ]);


        outputPage.drawImage(
            image,
            {
                x: 0,
                y: 0,
                width:
                    pageWidth,
                height:
                    pageHeight
            }
        );
    }


    return await outputPdf.save({
        useObjectStreams:
            true
    });
}


/* ========================================
   RESIZE PDF TO TARGET KB
======================================== */

generateResizePdfButton.addEventListener(
    "click",
    async () => {

        if (!resizePdfFile) {

            pdfStatus.textContent =
                "Please select a PDF first.";

            return;
        }

        const targetKb =
            getResizePdfTargetKb();

        if (
            !targetKb ||
            targetKb < 20
        ) {

            pdfStatus.textContent =
                "Please enter a valid target KB.";

            return;
        }


        const targetBytes =
            targetKb * 1024;

        /*
         Safe margin ताकि target से ऊपर न जाए.
        */
        const safeBytes =
            targetBytes * 0.985;


        generateResizePdfButton.disabled =
            true;

        downloadResizePdfButton.disabled =
            true;

        resizePdfProgress.hidden =
            false;

        resizePdfProgressBar.style.width =
            "5%";

        resizePdfProgressText.textContent =
            "Preparing PDF...";

        generateResizePdfButton.textContent =
            "Processing...";

        pdfStatus.textContent =
            `Preparing PDF under ${targetKb} KB...`;


        try {

            const sourceBytes =
                new Uint8Array(
                    await resizePdfFile.arrayBuffer()
                );


            /*
             Quality preset initial values
            */

            let initialScale =
                1.45;

            let initialQuality =
                0.82;


            if (
                resizePdfQuality.value ===
                "high"
            ) {

                initialScale =
                    1.7;

                initialQuality =
                    0.90;

            } else if (
                resizePdfQuality.value ===
                "small"
            ) {

                initialScale =
                    1.15;

                initialQuality =
                    0.65;
            }


            /*
             अलग scale/quality combinations try करेंगे.
             Best result = target के नीचे सबसे बड़ा file.
            */

            const attempts = [];

            const scales = [
                initialScale,
                initialScale * 0.88,
                initialScale * 0.76,
                initialScale * 0.64,
                initialScale * 0.52,
                initialScale * 0.42
            ];

            const qualities = [
                initialQuality,
                Math.max(
                    0.72,
                    initialQuality - 0.08
                ),
                Math.max(
                    0.60,
                    initialQuality - 0.16
                ),
                0.52,
                0.44,
                0.36
            ];


            let bestBytes =
                null;

            let bestSize =
                0;


            for (
                let index = 0;
                index < scales.length;
                index++
            ) {

                resizePdfProgressText.textContent =
                    `Optimizing PDF... attempt ${index + 1}/${scales.length}`;

                resizePdfProgressBar.style.width =
                    `${
                        10 +
                        Math.round(
                            index /
                            scales.length *
                            80
                        )
                    }%`;


                const candidate =
                    await buildRasterizedPdf(
                        sourceBytes,
                        scales[index],
                        qualities[index]
                    );


                const candidateSize =
                    candidate.length;


                attempts.push({
                    bytes:
                        candidate,
                    size:
                        candidateSize
                });


                if (
                    candidateSize <=
                        safeBytes &&
                    candidateSize >
                        bestSize
                ) {

                    bestBytes =
                        candidate;

                    bestSize =
                        candidateSize;
                }


                /*
                 Target के काफी करीब है तो stop.
                */

                if (
                    candidateSize <= safeBytes &&
                    candidateSize >= safeBytes * 0.90
                ) {
                    break;
                }
            }


            /*
             कोई भी target के नीचे नहीं आया तो
             सबसे छोटा available result लें.
            */

            if (!bestBytes) {

                attempts.sort(
                    (a, b) =>
                        a.size -
                        b.size
                );

                bestBytes =
                    attempts[0].bytes;

                bestSize =
                    attempts[0].size;
            }


            resizedPdfBytes =
                bestBytes;


            const outputKb =
                bestSize /
                1024;


            resizePdfProgressBar.style.width =
                "100%";

            resizePdfProgressText.textContent =
                "Processing complete.";


            if (
                bestSize <= targetBytes
            ) {

                resizePdfInfo.textContent =
                    `Limit: ${targetKb} KB | ` +
                    `Output: ${outputKb.toFixed(1)} KB | ` +
                    `${resizePdfPageCount} page(s)`;

                pdfStatus.textContent =
                    `PDF prepared successfully under ${targetKb} KB.`;

            } else {

                resizePdfInfo.textContent =
                    `Target: ${targetKb} KB | ` +
                    `Smallest Output: ${outputKb.toFixed(1)} KB | ` +
                    `${resizePdfPageCount} page(s)`;

                pdfStatus.textContent =
                    "PDF reduced, but this document could not reach the requested KB without making it unreadable.";
            }


            downloadResizePdfButton.disabled =
                false;


        } catch (error) {

            console.error(
                "[Daksh PDF Tools] Resize PDF failed:",
                error
            );

            resizedPdfBytes =
                null;

            downloadResizePdfButton.disabled =
                true;

            resizePdfInfo.textContent =
                "Unable to resize this PDF.";

            pdfStatus.textContent =
                "PDF resize failed.";

        } finally {

            generateResizePdfButton.disabled =
                false;

            generateResizePdfButton.textContent =
                "Resize PDF";

            setTimeout(
                () => {

                    resizePdfProgress.hidden =
                        true;

                    resizePdfProgressBar.style.width =
                        "0%";
                },
                1200
            );
        }
    }
);


/* ========================================
   DOWNLOAD RESIZED PDF
======================================== */

downloadResizePdfButton.addEventListener(
    "click",
    () => {

        if (!resizedPdfBytes) {
            return;
        }

        const blob =
            new Blob(
                [resizedPdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            "daksh-resized.pdf";

        link.click();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }
);


updateResizePdfTargetDisplay();



/* =========================================
   RESIZE PDF IN KB - FINAL QUALITY FIX
========================================= */

(function () {

    const panel =
        document.getElementById("resizePdfKbPanel");

    const targetSelect =
        document.getElementById("resizePdfTarget");

    const customInput =
        document.getElementById("resizePdfCustomKb");

    const qualitySelect =
        document.getElementById("resizePdfQuality");

    const generateButton =
        document.getElementById("generateResizePdf");

    const downloadButton =
        document.getElementById("downloadResizePdf");

    const info =
        document.getElementById("resizePdfInfo");

    const progress =
        document.getElementById("resizePdfProgress");

    const progressBar =
        document.getElementById("resizePdfProgressBar");

    const progressText =
        document.getElementById("resizePdfProgressText");

    if (
        !panel ||
        !generateButton ||
        !downloadButton
    ) {
        return;
    }


    let finalResizeBytes = null;
    let originalResizeBytes = null;
    let originalResizeName = "document.pdf";


    function getSelectedPdf() {

        if (
            typeof selectedPdfFiles !== "undefined" &&
            selectedPdfFiles &&
            selectedPdfFiles.length
        ) {
            return selectedPdfFiles[0];
        }

        if (
            typeof pdfMainInput !== "undefined" &&
            pdfMainInput &&
            pdfMainInput.files &&
            pdfMainInput.files.length
        ) {
            return pdfMainInput.files[0];
        }

        return null;
    }


    function getTargetKb() {

        let value =
            Number(targetSelect?.value || 0);

        if (
            targetSelect?.value === "custom" ||
            !value
        ) {
            value =
                Number(customInput?.value || 0);
        }

        return Math.max(
            1,
            Math.round(value || 200)
        );
    }


    function setProgress(percent, text) {

        if (progress) {
            progress.hidden = false;
        }

        if (progressBar) {
            progressBar.style.width =
                `${percent}%`;
        }

        if (progressText) {
            progressText.textContent =
                text;
        }
    }


    async function loadOriginal() {

        const file = getSelectedPdf();

        if (!file) {
            return null;
        }

        originalResizeBytes =
            new Uint8Array(
                await file.arrayBuffer()
            );

        originalResizeName =
            file.name || "document.pdf";

        return file;
    }


    async function rebuildPdf(
        sourceBytes,
        qualityScale
    ) {

        /*
         Browser-side PDF compression has limits.
         First preserve PDF structure and remove
         unnecessary save overhead where possible.
        */

        const source =
            await PDFLib.PDFDocument.load(
                sourceBytes,
                {
                    ignoreEncryption: true
                }
            );

        const output =
            await PDFLib.PDFDocument.create();

        const pageIndices =
            source.getPageIndices();

        const pages =
            await output.copyPages(
                source,
                pageIndices
            );

        pages.forEach(
            page => output.addPage(page)
        );


        /*
         qualityScale is reserved for progressive
         processing. Keeping page content vector-based
         gives much better text quality than rasterizing
         every page.
        */

        return new Uint8Array(
            await output.save({
                useObjectStreams: true,
                addDefaultPage: false,
                objectsPerTick:
                    qualityScale < 0.7
                        ? 25
                        : 50
            })
        );
    }


    generateButton.addEventListener(
        "click",
        async () => {

            generateButton.disabled = true;
            downloadButton.disabled = true;

            finalResizeBytes = null;

            try {

                const file =
                    await loadOriginal();

                if (!file) {

                    if (info) {
                        info.textContent =
                            "Please select a PDF first.";
                    }

                    return;
                }


                const targetKb =
                    getTargetKb();

                const targetBytes =
                    targetKb * 1024;

                const originalKb =
                    originalResizeBytes.length /
                    1024;


                /*
                 IMPORTANT:
                 Never enlarge an already-small PDF.
                */

                if (
                    originalResizeBytes.length <=
                    targetBytes
                ) {

                    finalResizeBytes =
                        originalResizeBytes.slice();

                    setProgress(
                        100,
                        "No compression required."
                    );

                    if (info) {

                        info.textContent =
                            `Already under ${targetKb} KB | ` +
                            `Original: ${originalKb.toFixed(1)} KB | ` +
                            `Output: ${originalKb.toFixed(1)} KB | ` +
                            `Original quality preserved`;
                    }

                    if (
                        typeof pdfStatus !== "undefined" &&
                        pdfStatus
                    ) {
                        pdfStatus.textContent =
                            `PDF is already under ${targetKb} KB. Original quality preserved.`;
                    }

                    downloadButton.disabled =
                        false;

                    return;
                }


                setProgress(
                    15,
                    "Optimizing PDF..."
                );


                /*
                 Try structure-preserving optimization.
                */

                let bestBytes =
                    await rebuildPdf(
                        originalResizeBytes,
                        1
                    );


                setProgress(
                    60,
                    "Checking output size..."
                );


                /*
                 If rebuilding unexpectedly makes the
                 document larger, keep original as the
                 quality-safe candidate.
                */

                if (
                    bestBytes.length >
                    originalResizeBytes.length
                ) {
                    bestBytes =
                        originalResizeBytes.slice();
                }


                finalResizeBytes =
                    bestBytes;


                const outputKb =
                    finalResizeBytes.length /
                    1024;


                setProgress(
                    100,
                    "PDF processing completed."
                );


                if (info) {

                    if (
                        finalResizeBytes.length <=
                        targetBytes
                    ) {

                        info.textContent =
                            `Limit: ${targetKb} KB | ` +
                            `Original: ${originalKb.toFixed(1)} KB | ` +
                            `Output: ${outputKb.toFixed(1)} KB | ` +
                            `Quality preserved`;

                    } else {

                        info.textContent =
                            `Target: ${targetKb} KB | ` +
                            `Best quality-safe output: ${outputKb.toFixed(1)} KB | ` +
                            `Further reduction may reduce readability`;
                    }
                }


                if (
                    typeof pdfStatus !== "undefined" &&
                    pdfStatus
                ) {

                    if (
                        finalResizeBytes.length <=
                        targetBytes
                    ) {

                        pdfStatus.textContent =
                            `PDF prepared successfully under ${targetKb} KB.`;

                    } else {

                        pdfStatus.textContent =
                            `Best quality-safe PDF prepared at ${outputKb.toFixed(1)} KB.`;
                    }
                }


                downloadButton.disabled =
                    false;


            } catch (error) {

                console.error(
                    "[Daksh PDF Tools] Resize PDF failed:",
                    error
                );

                if (info) {
                    info.textContent =
                        "Unable to process PDF.";
                }

                if (
                    typeof pdfStatus !== "undefined" &&
                    pdfStatus
                ) {
                    pdfStatus.textContent =
                        "Resize PDF failed. Please try again.";
                }

            } finally {

                generateButton.disabled =
                    false;
            }
        },
        true
    );


    downloadButton.addEventListener(
        "click",
        () => {

            if (!finalResizeBytes) {
                return;
            }

            const blob =
                new Blob(
                    [finalResizeBytes],
                    {
                        type:
                            "application/pdf"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            const baseName =
                originalResizeName
                    .replace(
                        /\.pdf$/i,
                        ""
                    );

            link.download =
                `${baseName}-resized.pdf`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            setTimeout(
                () =>
                    URL.revokeObjectURL(url),
                1000
            );
        },
        true
    );

})();



console.log(
    "[Daksh PDF Tools] Workbench loaded"
);


/* ========================================
   PDF TO IMAGES - COMPLETE TOOL
======================================== */

const pdfToImagesPanel =
    document.getElementById("pdfToImagesPanel");

const pdfImageFormat =
    document.getElementById("pdfToImagesFormat");

const pdfImageQuality =
    document.getElementById("pdfToImagesQuality");

const generatePdfImagesButton =
    document.getElementById("generatePdfImages");

const downloadAllPdfImagesButton =
    document.getElementById("downloadAllPdfImages");

const pdfToImagesInfo =
    document.getElementById("pdfToImagesInfo");

const pdfToImagesOutput =
    document.getElementById("pdfToImagesOutput");


let pdfToImagesFile = null;
let pdfToImagesDocument = null;
let generatedPdfImages = [];


/* ========================================
   ACTIVATE PDF TO IMAGES
======================================== */

pdfActionButtons.forEach((button) => {

    button.addEventListener(
        "click",
        async () => {

            if (
                button.dataset.pdfAction !==
                "pdf-to-image"
            ) {
                return;
            }

            activePdfTool =
                "pdf-to-image";

            pdfMainInput.accept =
                "application/pdf";

            pdfMainInput.multiple =
                false;


            if (imageToPdfPanel) {
                imageToPdfPanel.hidden =
                    true;
            }

            if (mergePdfPanel) {
                mergePdfPanel.hidden =
                    true;
            }

            if (splitPdfPanel) {
                splitPdfPanel.hidden =
                    true;
            }

            const resizePanel =
                document.getElementById(
                    "resizePdfKbPanel"
                );

            if (resizePanel) {
                resizePanel.hidden =
                    true;
            }


            if (pdfToImagesPanel) {

                pdfToImagesPanel.hidden =
                    false;

                if (
                    pdfActionPanel &&
                    pdfToImagesPanel.parentNode
                ) {

                    pdfActionPanel.parentNode.insertBefore(
                        pdfToImagesPanel,
                        pdfActionPanel
                    );
                }
            }


            pdfMainPreview.classList.remove(
                "merge-preview-mode",
                "split-preview-mode",
                "resize-preview-mode"
            );

            pdfMainPreview.classList.add(
                "pdf-to-images-preview-mode"
            );


            pdfStatus.textContent =
                "Selected tool: PDF to Images";


            if (pdfToImagesFile) {

                await renderPdfToImagesPreview();
            }
        }
    );
});


/* ========================================
   COMMON BROWSE -> PDF TO IMAGES
======================================== */

pdfMainInput.addEventListener(
    "change",
    async () => {

        if (
            activePdfTool !==
            "pdf-to-image"
        ) {
            return;
        }


        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );


        if (!files.length) {

            pdfToImagesFile =
                null;

            pdfToImagesDocument =
                null;

            generatedPdfImages =
                [];

            generatePdfImagesButton.disabled =
                true;

            downloadAllPdfImagesButton.disabled =
                true;

            pdfToImagesInfo.textContent =
                "Select a PDF to begin.";

            return;
        }


        pdfToImagesFile =
            files[0];

        generatedPdfImages =
            [];

        generatePdfImagesButton.disabled =
            true;

        downloadAllPdfImagesButton.disabled =
            true;


        pdfToImagesInfo.textContent =
            "Loading PDF preview...";

        pdfStatus.textContent =
            "Loading PDF pages...";


        await renderPdfToImagesPreview();
    }
);


/* ========================================
   RENDER PDF PAGE PREVIEW
======================================== */

async function renderPdfToImagesPreview() {

    if (!pdfToImagesFile) {
        return;
    }


    pdfMainPreview.innerHTML =
        "";

    pdfMainPreview.classList.add(
        "pdf-to-images-preview-mode"
    );


    try {

        const bytes =
            await pdfToImagesFile.arrayBuffer();


        pdfToImagesDocument =
            await pdfjsLib.getDocument({
                data: bytes
            }).promise;


        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "pdf-page-preview-grid";


        for (
            let pageNumber = 1;
            pageNumber <=
            pdfToImagesDocument.numPages;
            pageNumber++
        ) {

            const page =
                await pdfToImagesDocument.getPage(
                    pageNumber
                );


            const viewport =
                page.getViewport({
                    scale: 0.35
                });


            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                viewport.width;

            canvas.height =
                viewport.height;


            await page.render({
                canvasContext:
                    canvas.getContext("2d"),

                viewport
            }).promise;


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "pdf-page-preview-card";


            const label =
                document.createElement(
                    "span"
                );

            label.textContent =
                `Page ${pageNumber}`;


            card.appendChild(
                canvas
            );

            card.appendChild(
                label
            );


            grid.appendChild(
                card
            );
        }


        pdfMainPreview.appendChild(
            grid
        );


        const sizeMb =
            pdfToImagesFile.size /
            1024 /
            1024;


        pdfToImagesInfo.textContent =
            `${pdfToImagesDocument.numPages} page(s) found | ` +
            `${sizeMb.toFixed(2)} MB`;


        pdfStatus.textContent =
            `PDF loaded successfully | ` +
            `${pdfToImagesDocument.numPages} pages`;


        generatePdfImagesButton.disabled =
            false;


    } catch (error) {

        console.error(
            "[Daksh PDF Tools] PDF to Images preview failed:",
            error
        );


        pdfStatus.textContent =
            "Unable to load PDF.";

        pdfToImagesInfo.textContent =
            "PDF preview failed.";
    }
}


/* ========================================
   CONVERT ALL PAGES
======================================== */

generatePdfImagesButton.addEventListener(
    "click",
    async () => {

        if (!pdfToImagesDocument) {
            return;
        }


        generatePdfImagesButton.disabled =
            true;

        downloadAllPdfImagesButton.disabled =
            true;


        generatedPdfImages =
            [];

        pdfToImagesOutput.innerHTML =
            "";


        const originalText =
            generatePdfImagesButton.textContent;


        generatePdfImagesButton.textContent =
            "Processing...";


        pdfStatus.textContent =
            "Converting PDF pages to images...";


        try {

            const format =
                pdfImageFormat?.value ||
                "jpeg";


            const qualityValue =
                pdfImageQuality?.value ||
                "high";


            let scale = 2;


            if (
                qualityValue ===
                "standard"
            ) {
                scale = 1.5;
            }

            if (
                qualityValue ===
                "high"
            ) {
                scale = 2;
            }

            if (
                qualityValue ===
                "very-high"
            ) {
                scale = 3;
            }


            for (
                let pageNumber = 1;
                pageNumber <=
                pdfToImagesDocument.numPages;
                pageNumber++
            ) {

                pdfStatus.textContent =
                    `Processing page ${pageNumber} of ` +
                    `${pdfToImagesDocument.numPages}...`;


                const page =
                    await pdfToImagesDocument.getPage(
                        pageNumber
                    );


                const viewport =
                    page.getViewport({
                        scale
                    });


                const canvas =
                    document.createElement(
                        "canvas"
                    );

                canvas.width =
                    viewport.width;

                canvas.height =
                    viewport.height;


                const context =
                    canvas.getContext(
                        "2d"
                    );


                /*
                 JPEG transparent area को
                 black होने से रोकने के लिए
                 white background.
                */

                context.fillStyle =
                    "#ffffff";

                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                await page.render({
                    canvasContext:
                        context,

                    viewport
                }).promise;


                const mimeType =
                    format === "png"
                        ? "image/png"
                        : "image/jpeg";


                const extension =
                    format === "png"
                        ? "png"
                        : "jpg";


                const blob =
                    await new Promise(
                        (resolve) => {

                            canvas.toBlob(
                                resolve,
                                mimeType,
                                format === "png"
                                    ? undefined
                                    : 0.95
                            );
                        }
                    );


                if (!blob) {
                    throw new Error(
                        `Unable to create page ${pageNumber}`
                    );
                }


                const imageUrl =
                    URL.createObjectURL(
                        blob
                    );


                generatedPdfImages.push({
                    pageNumber,
                    blob,
                    imageUrl,
                    extension
                });


                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "pdf-output-image-card";


                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    imageUrl;

                image.alt =
                    `PDF Page ${pageNumber}`;


                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "pdf-output-image-info";

                info.textContent =
                    `Page ${pageNumber} | ` +
                    `${(blob.size / 1024).toFixed(1)} KB`;


                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.textContent =
                    `Download Page ${pageNumber}`;


                button.addEventListener(
                    "click",
                    () => {

                        downloadPdfPageImage(
                            generatedPdfImages[
                                pageNumber - 1
                            ]
                        );
                    }
                );


                card.appendChild(
                    image
                );

                card.appendChild(
                    info
                );

                card.appendChild(
                    button
                );


                pdfToImagesOutput.appendChild(
                    card
                );


                /*
                 Browser को थोड़ा समय दें,
                 ताकि बड़े PDF में UI freeze
                 न दिखे.
                */

                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            30
                        )
                );
            }


            downloadAllPdfImagesButton.disabled =
                false;


            pdfStatus.textContent =
                `${generatedPdfImages.length} image(s) created successfully.`;


            pdfToImagesInfo.textContent =
                `${generatedPdfImages.length} pages converted successfully.`;


        } catch (error) {

            console.error(
                "[Daksh PDF Tools] PDF to Images conversion failed:",
                error
            );


            pdfStatus.textContent =
                "PDF conversion failed.";

        } finally {

            generatePdfImagesButton.disabled =
                false;

            generatePdfImagesButton.textContent =
                originalText;
        }
    }
);


/* ========================================
   DOWNLOAD SINGLE IMAGE
======================================== */

function downloadPdfPageImage(
    imageData
) {

    if (!imageData) {
        return;
    }


    const link =
        document.createElement(
            "a"
        );


    link.href =
        imageData.imageUrl;


    link.download =
        `daksh-pdf-page-${imageData.pageNumber}.${imageData.extension}`;


    link.click();
}


/* ========================================
   DOWNLOAD ALL IMAGES
======================================== */

downloadAllPdfImagesButton.addEventListener(
    "click",
    async () => {

        if (
            !generatedPdfImages.length
        ) {
            return;
        }


        downloadAllPdfImagesButton.disabled =
            true;


        const originalText =
            downloadAllPdfImagesButton.textContent;


        downloadAllPdfImagesButton.textContent =
            "Downloading...";


        /*
         Browser security के कारण downloads
         थोड़े gap के साथ trigger करें.
        */

        for (
            let i = 0;
            i <
            generatedPdfImages.length;
            i++
        ) {

            downloadPdfPageImage(
                generatedPdfImages[i]
            );


            await new Promise(
                (resolve) =>
                    setTimeout(
                        resolve,
                        250
                    )
            );
        }


        downloadAllPdfImagesButton.textContent =
            originalText;

        downloadAllPdfImagesButton.disabled =
            false;
    }
);


console.log(
    "[Daksh PDF Tools] PDF to Images ready"
);



/* ========================================
   REMOVE PAGES - COMPLETE TOOL
======================================== */

const removePagesPanel =
    document.getElementById(
        "removePagesPanel"
    );

const selectAllRemovePagesButton =
    document.getElementById(
        "selectAllRemovePages"
    );

const clearRemovePagesButton =
    document.getElementById(
        "clearRemovePages"
    );

const removePagesInfo =
    document.getElementById(
        "removePagesInfo"
    );

const generateRemovePagesButton =
    document.getElementById(
        "generateRemovePages"
    );

const downloadRemovePagesButton =
    document.getElementById(
        "downloadRemovePages"
    );


let removePagesFile = null;
let removePagesDocument = null;
let removePagesPageCount = 0;

let selectedRemovePages =
    new Set();

let removedPagesPdfBytes =
    null;


/* ========================================
   ACTIVATE REMOVE PAGES
======================================== */

pdfActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            async () => {

                if (
                    button.dataset.pdfAction !==
                    "remove-pages"
                ) {
                    return;
                }


                activePdfTool =
                    "remove-pages";


                pdfMainInput.accept =
                    "application/pdf";

                pdfMainInput.multiple =
                    false;


                /*
                 बाकी processing panels hide करें
                */

                if (imageToPdfPanel) {
                    imageToPdfPanel.hidden =
                        true;
                }

                if (mergePdfPanel) {
                    mergePdfPanel.hidden =
                        true;
                }

                if (splitPdfPanel) {
                    splitPdfPanel.hidden =
                        true;
                }

                const resizePanel =
                    document.getElementById(
                        "resizePdfKbPanel"
                    );

                if (resizePanel) {
                    resizePanel.hidden =
                        true;
                }

                const imagesPanel =
                    document.getElementById(
                        "pdfToImagesPanel"
                    );

                if (imagesPanel) {
                    imagesPanel.hidden =
                        true;
                }


                removePagesPanel.hidden =
                    false;


                /*
                 Panel को cards के ऊपर रखें
                */

                if (
                    pdfActionPanel &&
                    removePagesPanel.parentNode
                ) {

                    pdfActionPanel.parentNode.insertBefore(
                        removePagesPanel,
                        pdfActionPanel
                    );
                }


                pdfMainPreview.classList.remove(
                    "merge-preview-mode",
                    "split-preview-mode",
                    "resize-preview-mode",
                    "pdf-to-images-preview-mode"
                );

                pdfMainPreview.classList.add(
                    "remove-pages-preview-mode"
                );


                pdfStatus.textContent =
                    "Selected tool: Remove Pages";


                if (removePagesFile) {

                    await renderRemovePagesPreview();
                }
            }
        );
    }
);


/* ========================================
   COMMON BROWSE -> REMOVE PAGES
======================================== */

pdfMainInput.addEventListener(
    "change",
    async () => {

        if (
            activePdfTool !==
            "remove-pages"
        ) {
            return;
        }


        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );


        if (!files.length) {

            removePagesFile =
                null;

            removePagesDocument =
                null;

            removePagesPageCount =
                0;

            selectedRemovePages.clear();

            removedPagesPdfBytes =
                null;


            generateRemovePagesButton.disabled =
                true;

            downloadRemovePagesButton.disabled =
                true;


            removePagesInfo.textContent =
                "Select a PDF file to begin.";

            return;
        }


        removePagesFile =
            files[0];

        selectedRemovePages.clear();

        removedPagesPdfBytes =
            null;


        generateRemovePagesButton.disabled =
            true;

        downloadRemovePagesButton.disabled =
            true;


        pdfStatus.textContent =
            "Loading PDF pages...";

        removePagesInfo.textContent =
            "Preparing page preview...";


        await renderRemovePagesPreview();
    }
);


/* ========================================
   RENDER REMOVE PAGE PREVIEW
======================================== */

async function renderRemovePagesPreview() {

    if (!removePagesFile) {
        return;
    }


    pdfMainPreview.innerHTML =
        "";

    pdfMainPreview.classList.add(
        "remove-pages-preview-mode"
    );


    try {

        const bytes =
            await removePagesFile.arrayBuffer();


        removePagesDocument =
            await pdfjsLib.getDocument({
                data: bytes
            }).promise;


        removePagesPageCount =
            removePagesDocument.numPages;


        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "remove-pages-grid";


        for (
            let pageNumber = 1;
            pageNumber <=
            removePagesPageCount;
            pageNumber++
        ) {

            const page =
                await removePagesDocument.getPage(
                    pageNumber
                );


            const baseViewport =
                page.getViewport({
                    scale: 1
                });


            const targetWidth =
                125;


            const scale =
                targetWidth /
                baseViewport.width;


            const viewport =
                page.getViewport({
                    scale
                });


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "remove-page-card";

            card.dataset.page =
                String(pageNumber);


            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                Math.ceil(
                    viewport.width
                );

            canvas.height =
                Math.ceil(
                    viewport.height
                );


            const context =
                canvas.getContext(
                    "2d"
                );


            await page.render({
                canvasContext:
                    context,
                viewport
            }).promise;


            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "remove-page-label";

            label.textContent =
                `Page ${pageNumber}`;


            const mark =
                document.createElement(
                    "div"
                );

            mark.className =
                "remove-page-mark";

            mark.textContent =
                "×";


            card.appendChild(
                canvas
            );

            card.appendChild(
                label
            );

            card.appendChild(
                mark
            );


            card.addEventListener(
                "click",
                () => {

                    const pageIndex =
                        pageNumber - 1;


                    if (
                        selectedRemovePages.has(
                            pageIndex
                        )
                    ) {

                        selectedRemovePages.delete(
                            pageIndex
                        );

                        card.classList.remove(
                            "selected"
                        );

                    } else {

                        selectedRemovePages.add(
                            pageIndex
                        );

                        card.classList.add(
                            "selected"
                        );
                    }


                    updateRemovePagesInfo();
                }
            );


            grid.appendChild(
                card
            );
        }


        pdfMainPreview.appendChild(
            grid
        );


        updateRemovePagesInfo();


        pdfStatus.textContent =
            `PDF loaded successfully | ${removePagesPageCount} pages`;


    } catch (error) {

        console.error(
            "[Daksh PDF Tools] Remove Pages preview failed:",
            error
        );


        pdfStatus.textContent =
            "Unable to load PDF.";

        removePagesInfo.textContent =
            "PDF preview failed.";
    }
}


/* ========================================
   UPDATE REMOVE INFO
======================================== */

function updateRemovePagesInfo() {

    const selected =
        selectedRemovePages.size;

    const remaining =
        removePagesPageCount -
        selected;


    if (!selected) {

        removePagesInfo.textContent =
            `${removePagesPageCount} page(s) found. ` +
            `Select pages you want to remove.`;

        generateRemovePagesButton.disabled =
            true;

        return;
    }


    if (remaining <= 0) {

        removePagesInfo.textContent =
            `All ${removePagesPageCount} pages selected. ` +
            `At least one page must remain.`;

        generateRemovePagesButton.disabled =
            true;

        return;
    }


    removePagesInfo.textContent =
        `${selected} page(s) selected for removal | ` +
        `${remaining} page(s) will remain`;


    generateRemovePagesButton.disabled =
        false;


    removedPagesPdfBytes =
        null;

    downloadRemovePagesButton.disabled =
        true;
}


/* ========================================
   SELECT ALL
======================================== */

selectAllRemovePagesButton.addEventListener(
    "click",
    () => {

        selectedRemovePages =
            new Set(
                Array.from(
                    {
                        length:
                            removePagesPageCount
                    },
                    (_, index) =>
                        index
                )
            );


        document.querySelectorAll(
            ".remove-page-card"
        ).forEach(
            (card) => {

                card.classList.add(
                    "selected"
                );
            }
        );


        updateRemovePagesInfo();
    }
);


/* ========================================
   CLEAR SELECTION
======================================== */

clearRemovePagesButton.addEventListener(
    "click",
    () => {

        selectedRemovePages.clear();


        document.querySelectorAll(
            ".remove-page-card"
        ).forEach(
            (card) => {

                card.classList.remove(
                    "selected"
                );
            }
        );


        updateRemovePagesInfo();
    }
);


/* ========================================
   REMOVE SELECTED PAGES
======================================== */

generateRemovePagesButton.addEventListener(
    "click",
    async () => {

        if (
            !removePagesFile ||
            !selectedRemovePages.size
        ) {

            return;
        }


        const keepPages =
            Array.from(
                {
                    length:
                        removePagesPageCount
                },
                (_, index) =>
                    index
            ).filter(
                (index) =>
                    !selectedRemovePages.has(
                        index
                    )
            );


        if (!keepPages.length) {

            pdfStatus.textContent =
                "At least one page must remain.";

            return;
        }


        generateRemovePagesButton.disabled =
            true;

        downloadRemovePagesButton.disabled =
            true;


        const originalText =
            generateRemovePagesButton.textContent;


        generateRemovePagesButton.textContent =
            "Processing...";


        pdfStatus.textContent =
            "Removing selected pages...";


        try {

            const {
                PDFDocument
            } = PDFLib;


            const sourceBytes =
                await removePagesFile.arrayBuffer();


            const sourcePdf =
                await PDFDocument.load(
                    sourceBytes
                );


            const outputPdf =
                await PDFDocument.create();


            const copiedPages =
                await outputPdf.copyPages(
                    sourcePdf,
                    keepPages
                );


            copiedPages.forEach(
                (page) => {

                    outputPdf.addPage(
                        page
                    );
                }
            );


            removedPagesPdfBytes =
                await outputPdf.save({
                    useObjectStreams:
                        true
                });


            const outputKb =
                removedPagesPdfBytes.length /
                1024;


            removePagesInfo.textContent =
                `${selectedRemovePages.size} page(s) removed | ` +
                `${keepPages.length} page(s) remaining | ` +
                `${outputKb.toFixed(1)} KB`;


            pdfStatus.textContent =
                "Selected pages removed successfully.";


            downloadRemovePagesButton.disabled =
                false;


        } catch (error) {

            console.error(
                "[Daksh PDF Tools] Remove Pages failed:",
                error
            );


            pdfStatus.textContent =
                "Unable to remove pages.";


        } finally {

            generateRemovePagesButton.disabled =
                false;

            generateRemovePagesButton.textContent =
                originalText;
        }
    }
);


/* ========================================
   DOWNLOAD PDF
======================================== */

downloadRemovePagesButton.addEventListener(
    "click",
    () => {

        if (!removedPagesPdfBytes) {
            return;
        }


        const blob =
            new Blob(
                [removedPagesPdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "daksh-pages-removed.pdf";


        link.click();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }
);


console.log(
    "[Daksh PDF Tools] Remove Pages ready"
);


/* ========================================
   ROTATE PAGES - COMPLETE TOOL
======================================== */

const rotatePagesPanel =
    document.getElementById(
        "rotatePagesPanel"
    );

const selectAllRotatePagesButton =
    document.getElementById(
        "selectAllRotatePages"
    );

const clearRotatePagesButton =
    document.getElementById(
        "clearRotatePages"
    );

const rotatePagesInfo =
    document.getElementById(
        "rotatePagesInfo"
    );

const rotatePagesLeftButton =
    document.getElementById(
        "rotatePagesLeft"
    );

const rotatePagesRightButton =
    document.getElementById(
        "rotatePagesRight"
    );

const rotatePages180Button =
    document.getElementById(
        "rotatePages180"
    );

const generateRotatedPdfButton =
    document.getElementById(
        "generateRotatedPdf"
    );

const downloadRotatedPdfButton =
    document.getElementById(
        "downloadRotatedPdf"
    );


let rotatePagesFile = null;
let rotatePagesDocument = null;
let rotatePagesPageCount = 0;

let selectedRotatePages =
    new Set();

/*
 page index -> added rotation
 Example:
 0 => 90
 1 => 180
*/
let rotatePageAngles =
    new Map();

let rotatedPdfBytes =
    null;


/* ========================================
   ACTIVATE ROTATE TOOL
======================================== */

pdfActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            async () => {

                if (
                    button.dataset.pdfAction !==
                    "rotate"
                ) {
                    return;
                }


                activePdfTool =
                    "rotate";


                pdfMainInput.accept =
                    "application/pdf";

                pdfMainInput.multiple =
                    false;


                /*
                 बाकी panels hide करें
                */

                if (imageToPdfPanel) {
                    imageToPdfPanel.hidden =
                        true;
                }

                if (mergePdfPanel) {
                    mergePdfPanel.hidden =
                        true;
                }

                if (splitPdfPanel) {
                    splitPdfPanel.hidden =
                        true;
                }


                const resizePanel =
                    document.getElementById(
                        "resizePdfKbPanel"
                    );

                if (resizePanel) {
                    resizePanel.hidden =
                        true;
                }


                const imagesPanel =
                    document.getElementById(
                        "pdfToImagesPanel"
                    );

                if (imagesPanel) {
                    imagesPanel.hidden =
                        true;
                }


                const removePanel =
                    document.getElementById(
                        "removePagesPanel"
                    );

                if (removePanel) {
                    removePanel.hidden =
                        true;
                }


                rotatePagesPanel.hidden =
                    false;


                /*
                 Rotate panel cards के ऊपर
                */

                if (
                    pdfActionPanel &&
                    rotatePagesPanel.parentNode
                ) {

                    pdfActionPanel.parentNode.insertBefore(
                        rotatePagesPanel,
                        pdfActionPanel
                    );
                }


                pdfMainPreview.classList.remove(
                    "merge-preview-mode",
                    "split-preview-mode",
                    "resize-preview-mode",
                    "pdf-to-images-preview-mode",
                    "remove-pages-preview-mode"
                );


                pdfMainPreview.classList.add(
                    "rotate-pages-preview-mode"
                );


                pdfStatus.textContent =
                    "Selected tool: Rotate Pages";


                if (rotatePagesFile) {

                    await renderRotatePagesPreview();
                }
            }
        );
    }
);


/*
 दूसरे tool पर जाने पर Rotate panel hide हो.
*/

pdfActionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                if (
                    button.dataset.pdfAction !==
                    "rotate" &&
                    rotatePagesPanel
                ) {

                    rotatePagesPanel.hidden =
                        true;
                }
            }
        );
    }
);


/* ========================================
   COMMON BROWSE -> ROTATE
======================================== */

pdfMainInput.addEventListener(
    "change",
    async () => {

        if (
            activePdfTool !==
            "rotate"
        ) {
            return;
        }


        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );


        if (!files.length) {

            rotatePagesFile =
                null;

            rotatePagesDocument =
                null;

            rotatePagesPageCount =
                0;

            selectedRotatePages.clear();

            rotatePageAngles.clear();

            rotatedPdfBytes =
                null;


            disableRotateControls();


            rotatePagesInfo.textContent =
                "Select a PDF file to begin.";

            return;
        }


        rotatePagesFile =
            files[0];

        selectedRotatePages.clear();

        rotatePageAngles.clear();

        rotatedPdfBytes =
            null;


        disableRotateControls();


        pdfStatus.textContent =
            "Loading PDF pages...";

        rotatePagesInfo.textContent =
            "Preparing page preview...";


        await renderRotatePagesPreview();
    }
);


/* ========================================
   RENDER ROTATE PREVIEW
======================================== */

async function renderRotatePagesPreview() {

    if (!rotatePagesFile) {
        return;
    }


    pdfMainPreview.innerHTML =
        "";

    pdfMainPreview.classList.add(
        "rotate-pages-preview-mode"
    );


    try {

        const bytes =
            await rotatePagesFile.arrayBuffer();


        rotatePagesDocument =
            await pdfjsLib.getDocument({
                data: bytes
            }).promise;


        rotatePagesPageCount =
            rotatePagesDocument.numPages;


        const grid =
            document.createElement(
                "div"
            );

        grid.className =
            "rotate-pages-grid";


        for (
            let pageNumber = 1;
            pageNumber <=
            rotatePagesPageCount;
            pageNumber++
        ) {

            const page =
                await rotatePagesDocument.getPage(
                    pageNumber
                );


            const baseViewport =
                page.getViewport({
                    scale: 1
                });


            const targetWidth =
                125;


            const scale =
                targetWidth /
                baseViewport.width;


            const viewport =
                page.getViewport({
                    scale
                });


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "rotate-page-card";

            card.dataset.page =
                String(pageNumber);


            const stage =
                document.createElement(
                    "div"
                );

            stage.className =
                "rotate-page-stage";


            const canvas =
                document.createElement(
                    "canvas"
                );

            canvas.width =
                Math.ceil(
                    viewport.width
                );

            canvas.height =
                Math.ceil(
                    viewport.height
                );

            canvas.dataset.page =
                String(pageNumber);


            const context =
                canvas.getContext(
                    "2d"
                );


            await page.render({
                canvasContext:
                    context,
                viewport
            }).promise;


            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "rotate-page-label";

            label.textContent =
                `Page ${pageNumber}`;


            const angleLabel =
                document.createElement(
                    "div"
                );

            angleLabel.className =
                "rotate-angle-label";

            angleLabel.dataset.page =
                String(pageNumber);

            angleLabel.textContent =
                "0°";


            const check =
                document.createElement(
                    "div"
                );

            check.className =
                "rotate-page-check";

            check.textContent =
                "✓";


            stage.appendChild(
                canvas
            );

            card.appendChild(
                stage
            );

            card.appendChild(
                label
            );

            card.appendChild(
                angleLabel
            );

            card.appendChild(
                check
            );


            card.addEventListener(
                "click",
                () => {

                    const pageIndex =
                        pageNumber - 1;


                    if (
                        selectedRotatePages.has(
                            pageIndex
                        )
                    ) {

                        selectedRotatePages.delete(
                            pageIndex
                        );

                        card.classList.remove(
                            "selected"
                        );

                    } else {

                        selectedRotatePages.add(
                            pageIndex
                        );

                        card.classList.add(
                            "selected"
                        );
                    }


                    updateRotatePagesInfo();
                }
            );


            grid.appendChild(
                card
            );
        }


        pdfMainPreview.appendChild(
            grid
        );


        updateRotatePagesInfo();


        pdfStatus.textContent =
            `PDF loaded successfully | ${rotatePagesPageCount} pages`;


    } catch (error) {

        console.error(
            "[Daksh PDF Tools] Rotate preview failed:",
            error
        );


        pdfStatus.textContent =
            "Unable to load PDF.";

        rotatePagesInfo.textContent =
            "PDF preview failed.";
    }
}


/* ========================================
   UPDATE CONTROLS
======================================== */

function updateRotatePagesInfo() {

    const selected =
        selectedRotatePages.size;


    rotatePagesInfo.textContent =
        selected
            ? `${selected} page(s) selected for rotation.`
            : `${rotatePagesPageCount} page(s) found. Select pages to rotate.`;


    const disabled =
        selected === 0;


    rotatePagesLeftButton.disabled =
        disabled;

    rotatePagesRightButton.disabled =
        disabled;

    rotatePages180Button.disabled =
        disabled;


    /*
     Apply तभी enable हो जब
     कम से कम किसी page की rotation बदली हो.
    */

    generateRotatedPdfButton.disabled =
        rotatePageAngles.size === 0;


    rotatedPdfBytes =
        null;

    downloadRotatedPdfButton.disabled =
        true;
}


function disableRotateControls() {

    rotatePagesLeftButton.disabled =
        true;

    rotatePagesRightButton.disabled =
        true;

    rotatePages180Button.disabled =
        true;

    generateRotatedPdfButton.disabled =
        true;

    downloadRotatedPdfButton.disabled =
        true;
}


/* ========================================
   NORMALIZE ANGLE
======================================== */

function normalizeRotation(
    angle
) {

    return (
        (
            angle % 360
        ) +
        360
    ) % 360;
}


/* ========================================
   PREVIEW ROTATION
======================================== */

function rotateSelectedPreview(
    delta
) {

    if (!selectedRotatePages.size) {
        return;
    }


    selectedRotatePages.forEach(
        (pageIndex) => {

            const oldAngle =
                rotatePageAngles.get(
                    pageIndex
                ) || 0;


            const newAngle =
                normalizeRotation(
                    oldAngle +
                    delta
                );


            if (newAngle === 0) {

                rotatePageAngles.delete(
                    pageIndex
                );

            } else {

                rotatePageAngles.set(
                    pageIndex,
                    newAngle
                );
            }


            const pageNumber =
                pageIndex + 1;


            const canvas =
                document.querySelector(
                    `.rotate-page-card[data-page="${pageNumber}"] canvas`
                );


            const angleLabel =
                document.querySelector(
                    `.rotate-angle-label[data-page="${pageNumber}"]`
                );


            if (canvas) {

                canvas.style.transform =
                    `rotate(${newAngle}deg)`;
            }


            if (angleLabel) {

                angleLabel.textContent =
                    `${newAngle}°`;
            }
        }
    );


    generateRotatedPdfButton.disabled =
        rotatePageAngles.size === 0;


    rotatedPdfBytes =
        null;

    downloadRotatedPdfButton.disabled =
        true;


    rotatePagesInfo.textContent =
        `${selectedRotatePages.size} selected | ` +
        `${rotatePageAngles.size} page(s) have rotation changes`;
}


/* ========================================
   ROTATE BUTTONS
======================================== */

rotatePagesLeftButton.addEventListener(
    "click",
    () => {

        rotateSelectedPreview(
            -90
        );
    }
);


rotatePagesRightButton.addEventListener(
    "click",
    () => {

        rotateSelectedPreview(
            90
        );
    }
);


rotatePages180Button.addEventListener(
    "click",
    () => {

        rotateSelectedPreview(
            180
        );
    }
);


/* ========================================
   SELECT ALL
======================================== */

selectAllRotatePagesButton.addEventListener(
    "click",
    () => {

        selectedRotatePages =
            new Set(
                Array.from(
                    {
                        length:
                            rotatePagesPageCount
                    },
                    (_, index) =>
                        index
                )
            );


        document.querySelectorAll(
            ".rotate-page-card"
        ).forEach(
            (card) => {

                card.classList.add(
                    "selected"
                );
            }
        );


        updateRotatePagesInfo();
    }
);


/* ========================================
   CLEAR SELECTION
======================================== */

clearRotatePagesButton.addEventListener(
    "click",
    () => {

        selectedRotatePages.clear();


        document.querySelectorAll(
            ".rotate-page-card"
        ).forEach(
            (card) => {

                card.classList.remove(
                    "selected"
                );
            }
        );


        updateRotatePagesInfo();
    }
);


/* ========================================
   APPLY ROTATION TO PDF
======================================== */

generateRotatedPdfButton.addEventListener(
    "click",
    async () => {

        if (
            !rotatePagesFile ||
            !rotatePageAngles.size
        ) {
            return;
        }


        generateRotatedPdfButton.disabled =
            true;

        downloadRotatedPdfButton.disabled =
            true;


        const oldText =
            generateRotatedPdfButton.textContent;


        generateRotatedPdfButton.textContent =
            "Processing...";


        pdfStatus.textContent =
            "Applying page rotation...";


        try {

            const {
                PDFDocument,
                degrees
            } = PDFLib;


            const sourceBytes =
                await rotatePagesFile.arrayBuffer();


            const pdf =
                await PDFDocument.load(
                    sourceBytes
                );


            const pages =
                pdf.getPages();


            rotatePageAngles.forEach(
                (
                    addedAngle,
                    pageIndex
                ) => {

                    const page =
                        pages[
                            pageIndex
                        ];


                    if (!page) {
                        return;
                    }


                    /*
                     Existing PDF rotation preserve करके
                     नई rotation जोड़ें.
                    */

                    const existingRotation =
                        page.getRotation()?.angle ||
                        0;


                    const finalAngle =
                        normalizeRotation(
                            existingRotation +
                            addedAngle
                        );


                    page.setRotation(
                        degrees(
                            finalAngle
                        )
                    );
                }
            );


            rotatedPdfBytes =
                await pdf.save({
                    useObjectStreams:
                        true
                });


            const sizeKb =
                rotatedPdfBytes.length /
                1024;


            rotatePagesInfo.textContent =
                `${rotatePageAngles.size} page(s) rotated | ` +
                `${sizeKb.toFixed(1)} KB`;


            pdfStatus.textContent =
                "PDF pages rotated successfully.";


            downloadRotatedPdfButton.disabled =
                false;


        } catch (error) {

            console.error(
                "[Daksh PDF Tools] Rotate Pages failed:",
                error
            );


            pdfStatus.textContent =
                "Unable to rotate PDF pages.";


        } finally {

            generateRotatedPdfButton.disabled =
                false;

            generateRotatedPdfButton.textContent =
                oldText;
        }
    }
);


/* ========================================
   DOWNLOAD ROTATED PDF
======================================== */

downloadRotatedPdfButton.addEventListener(
    "click",
    () => {

        if (!rotatedPdfBytes) {
            return;
        }


        const blob =
            new Blob(
                [rotatedPdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            "daksh-rotated.pdf";


        link.click();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }
);


console.log(
    "[Daksh PDF Tools] Rotate Pages ready"
);


/* ========================================
   COMMON BROWSE -> REORDER PAGES FIX
======================================== */

pdfMainInput.addEventListener(
    "change",
    async () => {

        if (
            activePdfTool !==
            "reorder"
        ) {
            return;
        }

        const files =
            Array.from(
                pdfMainInput.files || []
            ).filter(
                (file) =>
                    file.type ===
                    "application/pdf"
            );

        if (!files.length) {

            reorderPagesFile =
                null;

            reorderPagesDocument =
                null;

            reorderPagesPageCount =
                0;

            reorderPagesOrder =
                [];

            originalReorderOrder =
                [];

            reorderedPdfBytes =
                null;

            resetReorderPagesButton.disabled =
                true;

            generateReorderedPdfButton.disabled =
                true;

            downloadReorderedPdfButton.disabled =
                true;

            reorderPagesInfo.textContent =
                "Select a PDF file to begin.";

            return;
        }

        reorderPagesFile =
            files[0];

        reorderPagesDocument =
            null;

        reorderPagesPageCount =
            0;

        reorderPagesOrder =
            [];

        originalReorderOrder =
            [];

        reorderedPdfBytes =
            null;

        resetReorderPagesButton.disabled =
            true;

        generateReorderedPdfButton.disabled =
            true;

        downloadReorderedPdfButton.disabled =
            true;

        reorderPagesInfo.textContent =
            "Preparing page preview...";

        pdfStatus.textContent =
            "Loading PDF pages...";

        await renderReorderPagesPreview();
    }
);

console.log(
    "[Daksh PDF Tools] Reorder input handler ready"
);


/* ========================================
   REORDER PAGES - COMPLETE ENGINE
======================================== */

let reorderPagesFile = null;
let reorderPagesDocument = null;
let reorderPagesPageCount = 0;
let reorderPagesOrder = [];
let originalReorderOrder = [];
let reorderedPdfBytes = null;
let reorderDraggedIndex = null;

const reorderPagesInfo =
    document.getElementById(
        "reorderPagesInfo"
    );

const resetReorderPagesButton =
    document.getElementById(
        "resetReorderPages"
    );

const generateReorderedPdfButton =
    document.getElementById(
        "generateReorderedPdf"
    );

const downloadReorderedPdfButton =
    document.getElementById(
        "downloadReorderedPdf"
    );


/* ========================================
   RENDER REORDER PAGE PREVIEW
======================================== */

async function renderReorderPagesPreview() {

    if (!reorderPagesFile) {
        return;
    }

    try {

        pdfStatus.textContent =
            "Loading PDF pages...";

        pdfMainPreview.innerHTML =
            "";

        pdfMainPreview.classList.add(
            "reorder-pages-preview-mode"
        );


        const arrayBuffer =
            await reorderPagesFile.arrayBuffer();


        reorderPagesDocument =
            await pdfjsLib.getDocument({
                data: arrayBuffer
            }).promise;


        reorderPagesPageCount =
            reorderPagesDocument.numPages;


        reorderPagesOrder =
            Array.from(
                {
                    length:
                        reorderPagesPageCount
                },
                (_, index) =>
                    index
            );


        originalReorderOrder =
            [...reorderPagesOrder];


        await drawReorderCards();


        reorderPagesInfo.textContent =
            `${reorderPagesPageCount} page(s) ready — ` +
            `drag pages to change order.`;


        pdfStatus.textContent =
            `PDF loaded successfully | ` +
            `${reorderPagesPageCount} pages`;


        resetReorderPagesButton.disabled =
            false;

        generateReorderedPdfButton.disabled =
            false;

        downloadReorderedPdfButton.disabled =
            true;


    } catch (error) {

        console.error(
            "[Daksh PDF Tools] Reorder preview failed:",
            error
        );


        pdfMainPreview.innerHTML =
            '<div class="pdf-preview-empty">' +
            'Unable to load PDF preview.' +
            '</div>';


        reorderPagesInfo.textContent =
            "Unable to prepare PDF pages.";


        pdfStatus.textContent =
            "Unable to load PDF.";

    }
}


/* ========================================
   DRAW REORDER CARDS
======================================== */

async function drawReorderCards() {

    pdfMainPreview.innerHTML =
        "";


    for (
        let position = 0;
        position < reorderPagesOrder.length;
        position++
    ) {

        const originalIndex =
            reorderPagesOrder[position];


        const page =
            await reorderPagesDocument.getPage(
                originalIndex + 1
            );


        const viewport =
            page.getViewport({
                scale: 0.35
            });


        const canvas =
            document.createElement(
                "canvas"
            );


        const context =
            canvas.getContext(
                "2d"
            );


        canvas.width =
            viewport.width;

        canvas.height =
            viewport.height;


        await page.render({
            canvasContext:
                context,
            viewport
        }).promise;


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "pdf-preview-card reorder-page-card";


        card.draggable =
            true;


        card.dataset.position =
            position;


        card.innerHTML =
            `
            <div class="reorder-page-number">
                ${position + 1}
            </div>

            <div class="reorder-drag-handle">
                ↕
            </div>

            <div class="reorder-canvas-holder"></div>

            <div class="pdf-preview-label">
                Page ${originalIndex + 1}
            </div>
            `;


        card.querySelector(
            ".reorder-canvas-holder"
        ).appendChild(
            canvas
        );


        card.addEventListener(
            "dragstart",
            () => {

                reorderDraggedIndex =
                    Number(
                        card.dataset.position
                    );


                card.classList.add(
                    "dragging"
                );
            }
        );


        card.addEventListener(
            "dragend",
            () => {

                reorderDraggedIndex =
                    null;


                document
                    .querySelectorAll(
                        ".reorder-page-card"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "dragging",
                                "drag-target"
                            )
                    );
            }
        );


        card.addEventListener(
            "dragover",
            (event) => {

                event.preventDefault();


                card.classList.add(
                    "drag-target"
                );
            }
        );


        card.addEventListener(
            "dragleave",
            () => {

                card.classList.remove(
                    "drag-target"
                );
            }
        );


        card.addEventListener(
            "drop",
            async (event) => {

                event.preventDefault();


                const targetIndex =
                    Number(
                        card.dataset.position
                    );


                card.classList.remove(
                    "drag-target"
                );


                if (
                    reorderDraggedIndex ===
                        null ||
                    reorderDraggedIndex ===
                        targetIndex
                ) {
                    return;
                }


                const movedPage =
                    reorderPagesOrder.splice(
                        reorderDraggedIndex,
                        1
                    )[0];


                reorderPagesOrder.splice(
                    targetIndex,
                    0,
                    movedPage
                );


                reorderedPdfBytes =
                    null;


                downloadReorderedPdfButton.disabled =
                    true;


                reorderPagesInfo.textContent =
                    "Order changed — click Apply New Order.";


                await drawReorderCards();
            }
        );


        pdfMainPreview.appendChild(
            card
        );
    }
}


/* ========================================
   RESET ORIGINAL ORDER
======================================== */

resetReorderPagesButton.addEventListener(
    "click",
    async () => {

        if (!reorderPagesDocument) {
            return;
        }


        reorderPagesOrder =
            [...originalReorderOrder];


        reorderedPdfBytes =
            null;


        downloadReorderedPdfButton.disabled =
            true;


        reorderPagesInfo.textContent =
            "Original page order restored.";


        await drawReorderCards();
    }
);


/* ========================================
   APPLY NEW PAGE ORDER
======================================== */

generateReorderedPdfButton.addEventListener(
    "click",
    async () => {

        if (
            !reorderPagesFile ||
            !reorderPagesOrder.length
        ) {
            return;
        }


        const oldText =
            generateReorderedPdfButton.textContent;


        try {

            generateReorderedPdfButton.disabled =
                true;


            generateReorderedPdfButton.textContent =
                "Processing...";


            pdfStatus.textContent =
                "Creating reordered PDF...";


            const sourceBytes =
                await reorderPagesFile.arrayBuffer();


            const sourcePdf =
                await PDFLib.PDFDocument.load(
                    sourceBytes
                );


            const outputPdf =
                await PDFLib.PDFDocument.create();


            const copiedPages =
                await outputPdf.copyPages(
                    sourcePdf,
                    reorderPagesOrder
                );


            copiedPages.forEach(
                page =>
                    outputPdf.addPage(
                        page
                    )
            );


            reorderedPdfBytes =
                await outputPdf.save({
                    useObjectStreams:
                        true
                });


            const sizeKb =
                reorderedPdfBytes.length /
                1024;


            reorderPagesInfo.textContent =
                `${reorderPagesOrder.length} page(s) reordered | ` +
                `${sizeKb.toFixed(1)} KB`;


            pdfStatus.textContent =
                "PDF page order changed successfully.";


            downloadReorderedPdfButton.disabled =
                false;


        } catch (error) {

            console.error(
                "[Daksh PDF Tools] Reorder failed:",
                error
            );


            pdfStatus.textContent =
                "Unable to reorder PDF pages.";


            reorderPagesInfo.textContent =
                "Reorder operation failed.";


        } finally {

            generateReorderedPdfButton.disabled =
                false;


            generateReorderedPdfButton.textContent =
                oldText;
        }
    }
);


/* ========================================
   DOWNLOAD REORDERED PDF
======================================== */

downloadReorderedPdfButton.addEventListener(
    "click",
    () => {

        if (!reorderedPdfBytes) {
            return;
        }


        const blob =
            new Blob(
                [reorderedPdfBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "daksh-reordered.pdf";


        link.click();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            1000
        );
    }
);


console.log(
    "[Daksh PDF Tools] Reorder Pages engine ready"
);


/* =========================================
   PDF WORKBENCH - CLEAN INITIAL STATE
========================================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         पहली बार कोई PDF tool selected नहीं रहेगा.
        */

        document
            .querySelectorAll(
                ".photo-action-card"
            )
            .forEach(
                (card) => {
                    card.classList.remove(
                        "active"
                    );
                }
            );


        const processingPanels = [
            "imageToPdfPanel",
            "mergePdfPanel",
            "splitPdfPanel",
            "resizePdfKbPanel",
            "pdfToImagesPanel",
            "removePagesPanel",
            "rotatePagesPanel",
            "reorderPagesPanel"
        ];


        processingPanels.forEach(
            (id) => {

                const panel =
                    document.getElementById(
                        id
                    );

                if (panel) {
                    panel.hidden = true;
                }
            }
        );


        if (pdfMainPreview) {

            pdfMainPreview.classList.remove(
                "images-to-pdf-preview-mode",
                "merge-preview-mode",
                "split-preview-mode",
                "resize-preview-mode",
                "pdf-to-images-preview-mode",
                "remove-pages-preview-mode",
                "rotate-pages-preview-mode",
                "reorder-pages-preview-mode"
            );


            pdfMainPreview.innerHTML =
                "<span>File preview will appear here</span>";
        }


        if (pdfStatus) {

            pdfStatus.textContent =
                "Select file(s) to begin.";
        }


        console.log(
            "[Daksh PDF Tools] Clean initial state ready"
        );
    }
);

