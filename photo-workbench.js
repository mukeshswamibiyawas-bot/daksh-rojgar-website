import { removeBackground } from "https://esm.sh/@imgly/background-removal@1.7.0";

console.log(
    "[Daksh Photo Workbench] AI background library loaded"
);
"use strict";

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


/* ========================================
   BACKGROUND CHANGE TOOL
======================================== */

const imageInput =
    document.getElementById("backgroundImageInput");

const previewBox =
    document.getElementById("backgroundPreviewBox");

const statusText =
    document.getElementById("backgroundStatus");

const downloadButton =
    document.getElementById("downloadBackgroundImage");

const photoActionPanel =
    document.getElementById("photoActionPanel");

const photoActionButtons =
    document.querySelectorAll(".photo-action-card");

const backgroundToolControls =
    document.getElementById("backgroundToolControls");

/*
 Background Change को भी बाकी tools की तरह
 selected processing panel में रखें.
*/

const backgroundActionPanel =
    document.createElement("section");

backgroundActionPanel.id =
    "backgroundActionPanel";

backgroundActionPanel.className =
    "photo-processing-panel";

backgroundActionPanel.hidden =
    true;

const backgroundActionHeading =
    document.createElement("div");

backgroundActionHeading.className =
    "photo-processing-heading";

backgroundActionHeading.innerHTML =
    `<h2>Background Change</h2>
     <p>
       Remove the existing background and apply
       white, blue, red or a custom color.
     </p>`;

backgroundActionPanel.appendChild(
    backgroundActionHeading
);

if (backgroundToolControls) {

    backgroundToolControls.hidden =
        false;

    backgroundActionPanel.appendChild(
        backgroundToolControls
    );
}

/*
 Background result preview
*/

const backgroundResultPreview =
    document.createElement("div");

backgroundResultPreview.id =
    "backgroundResultPreview";

backgroundResultPreview.className =
    "passport-preview-wrapper";

backgroundResultPreview.innerHTML =
    `<span class="background-result-placeholder">
        White background preview will appear here
     </span>`;

backgroundActionPanel.appendChild(
    backgroundResultPreview
);


if (downloadButton) {

    /*
     Processing successful होने के बाद
     download enable होगा.
    */

    downloadButton.hidden =
        false;

    backgroundActionPanel.appendChild(
        downloadButton
    );
}

let originalImage = null;
let originalFileName = "";


/* ========================================
   PHOTO SELECT + PREVIEW
======================================== */

imageInput.addEventListener("change", function () {

    const file = this.files && this.files[0];

    if (!file) {
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

        statusText.textContent =
            "Please select a JPG, PNG or WebP image.";

        this.value = "";
        return;
    }


    /* Maximum 20 MB */

    if (file.size > 20 * 1024 * 1024) {

        statusText.textContent =
            "Photo is too large. Maximum size is 20 MB.";

        this.value = "";
        return;
    }


    statusText.textContent =
        "Loading photo...";


    const reader = new FileReader();


    reader.onload = function (event) {

        const image = new Image();


        image.onload = function () {

            originalImage = image;
            originalFileName = file.name;

            previewBox.innerHTML = "";

            const previewImage =
                document.createElement("img");

            previewImage.src = event.target.result;

            previewImage.alt =
                "Selected photo preview";

            previewBox.appendChild(previewImage);


            statusText.textContent =
                "Photo loaded successfully. " +
                image.naturalWidth +
                " × " +
                image.naturalHeight +
                " pixels";


            /*
             Download अभी disabled रहेगा।
             Background processing के बाद enable करेंगे.
            */

            downloadButton.disabled = true;

            if (photoActionPanel) {
                photoActionPanel.hidden = false;
                photoActionPanel.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        };


        image.onerror = function () {

            statusText.textContent =
                "Unable to read this image.";
        };


        image.src = event.target.result;
    };


    reader.onerror = function () {

        statusText.textContent =
            "Unable to load the selected photo.";
    };


    reader.readAsDataURL(file);
});

/* ========================================
   PHOTO ACTION SELECTION
======================================== */






photoActionButtons.forEach((button) => {
    button.addEventListener("click", () => {

        photoActionButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        const selectedAction =
            button.dataset.action || "";

        statusText.textContent =
            "Selected tool: " +
            button.querySelector("strong").textContent;

        if (backgroundActionPanel) {
            backgroundActionPanel.hidden =
                selectedAction !== "background";
        }

        /*
         Selected tool का processing panel
         इसी main Photo Tools box में खोलें.
        */

        if (passportToolPanel) {
            passportToolPanel.hidden =
                selectedAction !== "passport";
        }

        if (fourBySixToolPanel) {
            fourBySixToolPanel.hidden =
                selectedAction !== "four-by-six";
        }

        if (nameAddToolPanel) {
            nameAddToolPanel.hidden =
                selectedAction !== "name-add";
        }

        if (resizeToolPanel) {
            resizeToolPanel.hidden =
                selectedAction !== "resize";
        }

        if (compressToolPanel) {
            compressToolPanel.hidden =
                selectedAction !== "compress";
        }

        if (cropToolPanel) {
            cropToolPanel.hidden =
                selectedAction !== "crop";
        }

        if (convertToolPanel) {
            convertToolPanel.hidden =
                selectedAction !== "convert";
        }

        if (kbSizeToolPanel) {
            kbSizeToolPanel.hidden =
                selectedAction !== "kb-size";
        }

        if (
            selectedAction === "resize" &&
            resizeToolPanel
        ) {
            initializeResizeFields();
        }

        if (
            selectedAction === "compress" &&
            compressToolPanel
        ) {
            if (imageInput.files?.[0]) {
                compressInfo.textContent =
                    "Original Size: " +
                    formatFileSize(
                        imageInput.files[0].size
                    );
            }

            compressToolPanel.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }

        if (
            selectedAction === "passport" &&
            passportToolPanel
        ) {
            passportToolPanel.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }

        if (
            selectedAction === "four-by-six" &&
            fourBySixToolPanel
        ) {
            fourBySixToolPanel.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });
        }
    });
});

/* ========================================
   AI BACKGROUND REMOVAL + COLOR APPLY
======================================== */

const makeWhiteBackgroundButton =
    document.getElementById("makeWhiteBackground");

const outputCanvas =
    document.getElementById("backgroundCanvas");

const selectedBackgroundColor = "#ffffff";
let removedBackgroundBlob = null;
let processingBackground = false;
let backgroundAiSourceBlob = null;


async function prepareBackgroundAiSource() {

    if (!imageInput.files?.[0]) {
        throw new Error(
            "Please select a photo first."
        );
    }

    if (backgroundAiSourceBlob) {
        return backgroundAiSourceBlob;
    }

    const file =
        imageInput.files[0];

    const imageUrl =
        URL.createObjectURL(file);

    const image =
        new Image();

    await new Promise(
        (resolve, reject) => {

            image.onload =
                resolve;

            image.onerror =
                reject;

            image.src =
                imageUrl;
        }
    );

    const originalWidth =
        image.naturalWidth;

    const originalHeight =
        image.naturalHeight;

    /*
     AI processing के लिए maximum side 1600px रखें.
     इससे Firefox पर CPU/RAM load काफी कम होगा.
    */

    const maxSide = 1600;

    const scale =
        Math.min(
            1,
            maxSide /
            Math.max(
                originalWidth,
                originalHeight
            )
        );

    const width =
        Math.max(
            1,
            Math.round(
                originalWidth * scale
            )
        );

    const height =
        Math.max(
            1,
            Math.round(
                originalHeight * scale
            )
        );

    const canvas =
        document.createElement("canvas");

    canvas.width =
        width;

    canvas.height =
        height;

    const context =
        canvas.getContext("2d");

    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";

    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );

    URL.revokeObjectURL(
        imageUrl
    );

    backgroundAiSourceBlob =
        await new Promise(
            (resolve, reject) => {

                canvas.toBlob(
                    (blob) => {

                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(
                                new Error(
                                    "Unable to prepare AI image."
                                )
                            );
                        }
                    },
                    "image/jpeg",
                    0.92
                );
            }
        );

    return backgroundAiSourceBlob;
}


async function processBackground() {

    if (!originalImage || !imageInput.files?.[0]) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    if (processingBackground) {
        return;
    }

    processingBackground = true;
    downloadButton.disabled = true;

    statusText.textContent =
        "Preparing white background... Please wait.";

    try {

        if (!removedBackgroundBlob) {

            const aiSource =
                await prepareBackgroundAiSource();

            removedBackgroundBlob =
                await removeBackground(
                    aiSource,
                    {
                        output: {
                            format: "image/png",
                            quality: 1
                        }
                    }
                );
        }

        const transparentUrl =
            URL.createObjectURL(removedBackgroundBlob);

        const transparentImage =
            new Image();

        transparentImage.onload = function () {

            outputCanvas.width =
                transparentImage.naturalWidth;

            outputCanvas.height =
                transparentImage.naturalHeight;

            const context =
                outputCanvas.getContext("2d");

            context.clearRect(
                0,
                0,
                outputCanvas.width,
                outputCanvas.height
            );

            context.fillStyle =
                selectedBackgroundColor;

            context.fillRect(
                0,
                0,
                outputCanvas.width,
                outputCanvas.height
            );

            context.drawImage(
                transparentImage,
                0,
                0,
                outputCanvas.width,
                outputCanvas.height
            );

            const previewUrl =
                outputCanvas.toDataURL(
                    "image/jpeg",
                    0.95
                );

            /*
             ऊपर original preview को नहीं बदलेंगे.
             Processed White Background result
             Background Change panel में दिखाएँगे.
            */

            if (backgroundResultPreview) {

                backgroundResultPreview.innerHTML =
                    "";

                const resultImage =
                    document.createElement("img");

                resultImage.src =
                    previewUrl;

                resultImage.alt =
                    "White background preview";

                resultImage.style.maxWidth =
                    "100%";

                resultImage.style.maxHeight =
                    "600px";

                resultImage.style.objectFit =
                    "contain";

                resultImage.style.display =
                    "block";

                resultImage.style.margin =
                    "0 auto";

                backgroundResultPreview.appendChild(
                    resultImage
                );
            }

            downloadButton.disabled = false;

            statusText.textContent =
                "White background prepared successfully.";

            URL.revokeObjectURL(transparentUrl);
            processingBackground = false;
        };

        transparentImage.onerror = function () {

            statusText.textContent =
                "Unable to prepare the processed image.";

            URL.revokeObjectURL(transparentUrl);
            processingBackground = false;
        };

        transparentImage.src =
            transparentUrl;

    } catch (error) {

        console.error(
            "[Daksh Photo Workbench] Background removal failed:",
            error
        );

        statusText.textContent =
            "White background could not be prepared. Please try another photo.";

        processingBackground = false;
    }
}






/* ========================================
   WHITE BACKGROUND - RELIABLE CLICK HANDLER
======================================== */

console.log(
    "[Daksh] White background handler ready"
);

document.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                "#makeWhiteBackground"
            );

        if (!button) {
            return;
        }

        event.preventDefault();

        console.log(
            "[Daksh] Make White Background clicked"
        );

        if (processingBackground) {

            statusText.textContent =
                "⏳ Processing already in progress...";

            return;
        }

        button.disabled = true;

        button.textContent =
            "⏳ Processing... Please wait";

        statusText.textContent =
            "⏳ Processing photo... Please wait.";

        document.body.style.cursor =
            "progress";

        /*
         Browser को Processing text
         पहले screen पर दिखाने दें.
        */

        await new Promise(
            (resolve) =>
                setTimeout(resolve, 150)
        );

        try {

            await processBackground();

        } catch (error) {

            console.error(
                "[Daksh] White background error:",
                error
            );

            statusText.textContent =
                "White background processing failed.";

            processingBackground =
                false;
        }

        /*
         processBackground के image.onload /
         image.onerror complete होने तक wait.
        */

        const finishWatcher =
            setInterval(() => {

                if (!processingBackground) {

                    clearInterval(
                        finishWatcher
                    );

                    button.disabled =
                        false;

                    button.textContent =
                        "Make White Background";

                    document.body.style.cursor =
                        "";
                }

            }, 200);
    }
);


downloadButton.addEventListener("click", () => {

    if (
        downloadButton.disabled ||
        !outputCanvas.width ||
        !outputCanvas.height
    ) {
        return;
    }

    const link =
        document.createElement("a");

    link.download =
        "daksh-white-background-photo.jpg";

    link.href =
        outputCanvas.toDataURL(
            "image/jpeg",
            0.95
        );

    link.click();
});


/* ========================================
   PASSPORT SIZE PHOTO MAKER
======================================== */

const passportToolPanel =
    document.getElementById("passportToolPanel");

const passportSizeSelect =
    document.getElementById("passportSizeSelect");

const generatePassportButton =
    document.getElementById("generatePassportPhoto");

const downloadPassportButton =
    document.getElementById("downloadPassportPhoto");

const passportCanvas =
    document.getElementById("passportCanvas");

let passportOutputReady = false;


function getPassportDimensions(sizeValue) {

    /*
     300 DPI approximate pixel sizes
    */

    if (sizeValue === "2x2") {
        return {
            width: 600,
            height: 600
        };
    }

    /*
     Standard 35 × 45 mm passport photo
    */

    return {
        width: 413,
        height: 531
    };
}



async function loadImageFromBlob(blob) {

    return new Promise((resolve, reject) => {

        const objectUrl =
            URL.createObjectURL(blob);

        const image =
            new Image();

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(
                new Error(
                    "Processed photo could not be loaded"
                )
            );
        };

        image.src = objectUrl;
    });
}


async function getPassportSourceImage() {

    if (!originalImage) {
        throw new Error(
            "Please select a photo first"
        );
    }

    /*
     Passport Size is independent from
     Background Change.

     Never run AI background removal here.
     Always use the original uploaded photo.
    */

    return originalImage;
}


async function generatePassportPhoto() {

    generatePassportButton.disabled = true;
    downloadPassportButton.disabled = true;

    statusText.textContent =
        "Generating passport photo...";

    try {

        const sourceImage =
            await getPassportSourceImage();

        const dimensions =
            getPassportDimensions(
                passportSizeSelect.value
            );

        passportCanvas.width =
            dimensions.width;

        passportCanvas.height =
            dimensions.height;

        const context =
            passportCanvas.getContext(
                "2d"
            );

        const sourceWidth =
            sourceImage.naturalWidth ||
            sourceImage.width;

        const sourceHeight =
            sourceImage.naturalHeight ||
            sourceImage.height;

        /*
         Passport frame को पूरा भरें.
         Aspect ratio preserve रहेगा.
         जरूरत पड़ने पर किनारों से crop होगा,
         लेकिन white strip नहीं आएगी.
        */

        const scale = Math.max(
            passportCanvas.width / sourceWidth,
            passportCanvas.height / sourceHeight
        );

        const drawWidth =
            sourceWidth * scale;

        const drawHeight =
            sourceHeight * scale;

        const drawX =
            (passportCanvas.width - drawWidth) / 2;

        /*
         Face को थोड़ा ऊपर priority दें.
         Center crop की तुलना में passport photo
         अधिक natural दिखेगी.
        */

        let drawY =
            (passportCanvas.height - drawHeight) / 2;

        if (drawHeight > passportCanvas.height) {
            drawY =
                Math.max(
                    passportCanvas.height - drawHeight,
                    drawY - passportCanvas.height * 0.04
                );
        }

        context.drawImage(
            sourceImage,
            drawX,
            drawY,
            drawWidth,
            drawHeight
        );

        context.strokeStyle =
            "#d5d5d5";

        context.lineWidth = 2;

        context.strokeRect(
            1,
            1,
            passportCanvas.width - 2,
            passportCanvas.height - 2
        );

        passportOutputReady = true;

        downloadPassportButton.disabled =
            false;

        statusText.textContent =
            "Passport photo generated successfully.";

    } catch (error) {

        console.error(
            "[Daksh Photo Workbench] Passport generation failed:",
            error
        );

        statusText.textContent =
            "Passport photo generation failed. Please try again.";

    } finally {

        generatePassportButton.disabled =
            false;
    }
}






generatePassportButton.addEventListener(
    "click",
    generatePassportPhoto
);


passportSizeSelect.addEventListener(
    "change",
    () => {

        if (passportOutputReady) {
            generatePassportPhoto();
        }
    }
);


downloadPassportButton.addEventListener(
    "click",
    () => {

        if (
            !passportOutputReady ||
            !passportCanvas.width ||
            !passportCanvas.height
        ) {
            return;
        }

        const link =
            document.createElement("a");

        link.download =
            "daksh-passport-photo.jpg";

        link.href =
            passportCanvas.toDataURL(
                "image/jpeg",
                0.95
            );

        link.click();
    }
);


/* ========================================
   KEEP SELECTED TOOL INSIDE MAIN PHOTO BOX
======================================== */

const mainPhotoToolBox =
    document.querySelector(".background-tool-panel");

if (
    mainPhotoToolBox &&
    passportToolPanel
) {
    mainPhotoToolBox.appendChild(
        passportToolPanel
    );
}


/* ========================================
   4x6 PHOTO SHEET MAKER
======================================== */

const fourBySixToolPanel =
    document.getElementById("fourBySixToolPanel");

const fourBySixPhotoSize =
    document.getElementById("fourBySixPhotoSize");

const fourBySixPhotoCount =
    document.getElementById("fourBySixPhotoCount");

const fourBySixMode =
    document.getElementById("fourBySixMode");

const generateFourBySixButton =
    document.getElementById("generateFourBySix");

const downloadFourBySixButton =
    document.getElementById("downloadFourBySix");

const fourBySixCanvas =
    document.getElementById("fourBySixCanvas");

let fourBySixReady = false;


/*
  4 x 6 inch at 300 DPI
  = 1200 x 1800 pixels
*/

function getFourBySixPhotoDimensions() {

    if (fourBySixPhotoSize.value === "2x2") {
        return {
            width: 600,
            height: 600
        };
    }

    return {
        width: 413,
        height: 531
    };
}



async function getFourBySixSourcePhoto() {

    /*
     1. Passport photo पहले से बनी है तो वही use करें.
    */
    if (
        passportOutputReady &&
        passportCanvas.width > 0 &&
        passportCanvas.height > 0
    ) {
        return passportCanvas;
    }

    /*
     2. Background Change पहले से किया गया है
        तो processed canvas use करें.
    */
    if (
        removedBackgroundBlob &&
        outputCanvas &&
        outputCanvas.width > 0 &&
        outputCanvas.height > 0 &&
        !downloadButton.disabled
    ) {
        return outputCanvas;
    }

    /*
     3. सामान्य 4x6 बनाने के लिए AI बिल्कुल न चलाएँ.
        Original uploaded photo use करें.
    */
    if (originalImage) {
        return originalImage;
    }

    throw new Error("No photo available");
}




async function generateFourBySixSheet() {

    if (!originalImage) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    generateFourBySixButton.disabled = true;
    downloadFourBySixButton.disabled = true;

    statusText.textContent =
        "Generating print-ready 4×6 photo sheet...";

    try {

        const source =
            await getFourBySixSourcePhoto();

        const count =
            Number(fourBySixPhotoCount.value);

        const sizeType =
            fourBySixPhotoSize.value;

        /*
         ====================================
         SINGLE FULL 4×6 PHOTO
         ====================================
        */

        


if (count === 1) {

    const sourceWidth =
        source.naturalWidth ||
        source.width;

    const sourceHeight =
        source.naturalHeight ||
        source.height;

    /*
     Single 4×6 हमेशा Portrait रहेगा.
     4 inch × 6 inch @ 300 DPI
     = 1200 × 1800 pixels
    */

    const sheetWidth = 1200;
    const sheetHeight = 1800;

    fourBySixCanvas.width =
        sheetWidth;

    fourBySixCanvas.height =
        sheetHeight;

    const context =
        fourBySixCanvas.getContext("2d");

    context.fillStyle =
        "#ffffff";

    context.fillRect(
        0,
        0,
        sheetWidth,
        sheetHeight
    );

    const mode =
        fourBySixMode?.value || "fill";

    let scale;

    if (mode === "fill") {

        /*
         Fill mode:
         Portrait 4×6 पूरा भरेगा.
         जरूरत पड़ने पर left/right
         या top/bottom crop होगा.
        */

        scale = Math.max(
            sheetWidth / sourceWidth,
            sheetHeight / sourceHeight
        );

    } else {

        /*
         Fit mode:
         पूरी फोटो दिखाई देगी.
         खाली जगह white रहेगी.
        */

        scale = Math.min(
            sheetWidth / sourceWidth,
            sheetHeight / sourceHeight
        );
    }

    const drawWidth =
        sourceWidth * scale;

    const drawHeight =
        sourceHeight * scale;

    const drawX =
        (sheetWidth - drawWidth) / 2;

    const drawY =
        (sheetHeight - drawHeight) / 2;

    context.drawImage(
        source,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );

    fourBySixReady = true;

    downloadFourBySixButton.disabled =
        false;

    statusText.textContent =
        mode === "fill"
            ? "Portrait 4×6 photo generated in Fill mode."
            : "Portrait 4×6 photo generated in Fit mode.";

    return;
}





        let photoWidth;
        let photoHeight;

        if (sizeType === "2x2") {
            photoWidth = 600;
            photoHeight = 600;
        } else {
            /*
             35 × 45 mm at 300 DPI
            */
            photoWidth = 413;
            photoHeight = 531;
        }


        /*
         ====================================
         4×6 inch sheet @ 300 DPI

         Portrait  = 1200 × 1800
         Landscape = 1800 × 1200
         ====================================
        */

        let sheetWidth = 1200;
        let sheetHeight = 1800;

        let columns = 2;
        let rows = Math.ceil(count / 2);


        /*
         8 passport photos need landscape
         layout to preserve actual 35×45 size.
        */

        if (
            count === 8 &&
            sizeType === "35x45"
        ) {
            sheetWidth = 1800;
            sheetHeight = 1200;

            columns = 4;
            rows = 2;
        }


        /*
         2×2 inch photos:
         6 photos exactly occupy a 4×6 sheet.
         8 full-size 2×2 photos cannot physically
         fit on one 4×6 sheet.
        */

        if (
            sizeType === "2x2" &&
            count === 8
        ) {
            statusText.textContent =
                "8 photos of 2×2 inch cannot fit at true size on one 4×6 sheet. Please choose 4 or 6 photos.";

            return;
        }


        fourBySixCanvas.width =
            sheetWidth;

        fourBySixCanvas.height =
            sheetHeight;

        const context =
            fourBySixCanvas.getContext("2d");

        context.fillStyle =
            "#ffffff";

        context.fillRect(
            0,
            0,
            sheetWidth,
            sheetHeight
        );


        /*
         Calculate equal spacing while keeping
         the photograph at its real print size.
        */

        const totalPhotoWidth =
            columns * photoWidth;

        const totalPhotoHeight =
            rows * photoHeight;

        const horizontalSpace =
            Math.max(
                0,
                sheetWidth - totalPhotoWidth
            );

        const verticalSpace =
            Math.max(
                0,
                sheetHeight - totalPhotoHeight
            );

        const horizontalGap =
            horizontalSpace /
            (columns + 1);

        const verticalGap =
            verticalSpace /
            (rows + 1);


        for (let i = 0; i < count; i++) {

            const column =
                i % columns;

            const row =
                Math.floor(i / columns);

            const x =
                horizontalGap +
                column *
                (
                    photoWidth +
                    horizontalGap
                );

            const y =
                verticalGap +
                row *
                (
                    photoHeight +
                    verticalGap
                );


            context.drawImage(
                source,
                x,
                y,
                photoWidth,
                photoHeight
            );


            /*
             Cutting guide
            */

            context.strokeStyle =
                "#b5b5b5";

            context.lineWidth = 2;

            context.strokeRect(
                x,
                y,
                photoWidth,
                photoHeight
            );
        }


        fourBySixReady = true;

        downloadFourBySixButton.disabled =
            false;

        statusText.textContent =
            `${count} photos arranged successfully on a print-ready 4×6 sheet.`;

    } catch (error) {

        console.error(
            "[Daksh Photo Workbench] 4x6 generation failed:",
            error
        );

        statusText.textContent =
            "Unable to generate 4×6 photo sheet.";

    } finally {

        generateFourBySixButton.disabled =
            false;
    }
}


/*
  4×6 card selection
*/




generateFourBySixButton.addEventListener(
    "click",
    generateFourBySixSheet
);


downloadFourBySixButton.addEventListener(
    "click",
    () => {

        if (!fourBySixReady) {
            return;
        }

        const link =
            document.createElement("a");

        link.download =
            "daksh-4x6-photo-sheet.jpg";

        link.href =
            fourBySixCanvas.toDataURL(
                "image/jpeg",
                0.95
            );

        link.click();
    }
);


/*
  4×6 panel भी उसी main Photo Tools box में
*/

if (
    mainPhotoToolBox &&
    fourBySixToolPanel
) {
    mainPhotoToolBox.appendChild(
        fourBySixToolPanel
    );
}




/* ========================================
   NAME / DATE ADD TOOL
======================================== */

const nameAddToolPanel =
    document.getElementById("nameAddToolPanel");

const nameAddText =
    document.getElementById("nameAddText");

const nameAddDate =
    document.getElementById("nameAddDate");

const nameAddFontSize =
    document.getElementById("nameAddFontSize");

const nameAddColor =
    document.getElementById("nameAddColor");

const nameAddPosition =
    document.getElementById("nameAddPosition");

const nameAddStrip =
    document.getElementById("nameAddStrip");

const generateNameAddButton =
    document.getElementById("generateNameAdd");

const downloadNameAddButton =
    document.getElementById("downloadNameAdd");

const nameAddCanvas =
    document.getElementById("nameAddCanvas");

let nameAddReady = false;


function generateNameAddPhoto() {

    if (!originalImage) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    const source =
        (
            outputCanvas &&
            outputCanvas.width > 0 &&
            outputCanvas.height > 0 &&
            removedBackgroundBlob
        )
            ? outputCanvas
            : originalImage;

    const sourceWidth =
        source.naturalWidth ||
        source.width;

    const sourceHeight =
        source.naturalHeight ||
        source.height;

    const text =
        nameAddText.value.trim();

    const secondLine =
        nameAddDate.value.trim();

    /*
     Font size photo resolution के अनुसार scale होगा.
     Dropdown value base size है.
    */

    const baseFontSize =
        Number(nameAddFontSize.value) || 32;

    const resolutionScale =
        Math.max(
            1,
            sourceWidth / 1000
        );

    const fontSize =
        Math.round(
            baseFontSize * resolutionScale
        );

    const position =
        nameAddPosition.value;

    const stripMode =
        nameAddStrip.value;

    const lineGap =
        Math.round(fontSize * 0.35);

    const padding =
        Math.round(fontSize * 0.6);

    let lines = 0;

    if (text) lines++;
    if (secondLine) lines++;

    const stripHeight =
        lines > 0
            ? (
                padding * 2 +
                lines * fontSize +
                Math.max(0, lines - 1) * lineGap
              )
            : 0;

    nameAddCanvas.width =
        sourceWidth;

    nameAddCanvas.height =
        sourceHeight;

    const context =
        nameAddCanvas.getContext("2d");

    context.clearRect(
        0,
        0,
        sourceWidth,
        sourceHeight
    );

    context.drawImage(
        source,
        0,
        0,
        sourceWidth,
        sourceHeight
    );

    if (lines > 0) {

        const stripY =
            position === "top"
                ? 0
                : sourceHeight - stripHeight;

        if (stripMode !== "transparent") {

            context.fillStyle =
                stripMode === "black"
                    ? "#000000"
                    : "#ffffff";

            context.fillRect(
                0,
                stripY,
                sourceWidth,
                stripHeight
            );
        }

        let textColor =
            nameAddColor.value || "#000000";

        if (
            stripMode === "black" &&
            textColor === "#000000"
        ) {
            textColor = "#ffffff";
        }

        context.fillStyle =
            textColor;

        context.textAlign =
            "center";

        context.textBaseline =
            "top";

        context.font =
            `700 ${fontSize}px Arial, sans-serif`;

        let y =
            stripY + padding;

        if (text) {
            context.fillText(
                text,
                sourceWidth / 2,
                y
            );

            y +=
                fontSize +
                lineGap;
        }

        if (secondLine) {

            context.font =
                `500 ${Math.max(18, fontSize - 6)}px Arial, sans-serif`;

            context.fillText(
                secondLine,
                sourceWidth / 2,
                y
            );
        }
    }

    nameAddReady = true;

    downloadNameAddButton.disabled =
        false;

    statusText.textContent =
        "Name / text added successfully.";
}


generateNameAddButton.addEventListener(
    "click",
    generateNameAddPhoto
);


downloadNameAddButton.addEventListener(
    "click",
    () => {

        if (!nameAddReady) {
            return;
        }

        const link =
            document.createElement("a");

        link.download =
            "daksh-name-added-photo.jpg";

        link.href =
            nameAddCanvas.toDataURL(
                "image/jpeg",
                0.95
            );

        link.click();
    }
);


/*
 Name Add panel को उसी main Photo Tools box में रखें
*/

if (
    mainPhotoToolBox &&
    nameAddToolPanel
) {
    mainPhotoToolBox.appendChild(
        nameAddToolPanel
    );
}



/* ========================================
   PHOTO RESIZE TOOL
======================================== */

const resizeToolPanel =
    document.getElementById("resizeToolPanel");

const resizeWidth =
    document.getElementById("resizeWidth");

const resizeHeight =
    document.getElementById("resizeHeight");

const resizePreset =
    document.getElementById("resizePreset");

const resizeKeepRatio =
    document.getElementById("resizeKeepRatio");

const generateResizeButton =
    document.getElementById("generateResize");

const downloadResizeButton =
    document.getElementById("downloadResize");

const resizeCanvas =
    document.getElementById("resizeCanvas");

const resizeInfo =
    document.getElementById("resizeInfo");

let resizeReady = false;
let resizeAspectRatio = 1;
let resizeUpdating = false;


function getResizeSource() {

    if (
        outputCanvas &&
        outputCanvas.width > 0 &&
        outputCanvas.height > 0 &&
        removedBackgroundBlob
    ) {
        return outputCanvas;
    }

    return originalImage;
}


function initializeResizeFields() {

    const source =
        getResizeSource();

    if (!source) {
        return;
    }

    const width =
        source.naturalWidth ||
        source.width;

    const height =
        source.naturalHeight ||
        source.height;

    resizeAspectRatio =
        width / height;

    resizeWidth.value =
        width;

    resizeHeight.value =
        height;

    resizeInfo.textContent =
        `Original Size: ${width} × ${height} px`;
}


resizeWidth.addEventListener(
    "input",
    () => {

        if (
            resizeUpdating ||
            !resizeKeepRatio.checked
        ) {
            return;
        }

        const width =
            Number(resizeWidth.value);

        if (!width || width < 1) {
            return;
        }

        resizeUpdating = true;

        resizeHeight.value =
            Math.max(
                1,
                Math.round(
                    width / resizeAspectRatio
                )
            );

        resizeUpdating = false;
    }
);


resizeHeight.addEventListener(
    "input",
    () => {

        if (
            resizeUpdating ||
            !resizeKeepRatio.checked
        ) {
            return;
        }

        const height =
            Number(resizeHeight.value);

        if (!height || height < 1) {
            return;
        }

        resizeUpdating = true;

        resizeWidth.value =
            Math.max(
                1,
                Math.round(
                    height * resizeAspectRatio
                )
            );

        resizeUpdating = false;
    }
);


resizePreset.addEventListener(
    "change",
    () => {

        if (!resizePreset.value) {
            return;
        }

        const parts =
            resizePreset.value.split("x");

        if (parts.length !== 2) {
            return;
        }

        resizeUpdating = true;

        resizeWidth.value =
            Number(parts[0]);

        resizeHeight.value =
            Number(parts[1]);

        /*
         Preset dimensions exact रहें,
         इसलिए preset चुनने पर ratio lock
         स्वतः off करेंगे.
        */

        resizeKeepRatio.checked =
            false;

        resizeUpdating = false;
    }
);


function generateResizedPhoto() {

    const source =
        getResizeSource();

    if (!source) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    const width =
        Number(resizeWidth.value);

    const height =
        Number(resizeHeight.value);

    if (
        !width ||
        !height ||
        width < 1 ||
        height < 1
    ) {
        statusText.textContent =
            "Please enter valid width and height.";
        return;
    }

    /*
     बहुत बड़ा canvas browser को slow कर सकता है.
    */

    if (
        width > 8000 ||
        height > 8000
    ) {
        statusText.textContent =
            "Maximum resize dimension is 8000 pixels.";
        return;
    }

    resizeCanvas.width =
        width;

    resizeCanvas.height =
        height;

    const context =
        resizeCanvas.getContext("2d");

    context.clearRect(
        0,
        0,
        width,
        height
    );

    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";

    context.drawImage(
        source,
        0,
        0,
        width,
        height
    );

    resizeReady = true;

    downloadResizeButton.disabled =
        false;

    resizeInfo.textContent =
        `New Size: ${width} × ${height} px`;

    statusText.textContent =
        "Photo resized successfully.";
}


generateResizeButton.addEventListener(
    "click",
    generateResizedPhoto
);


downloadResizeButton.addEventListener(
    "click",
    () => {

        if (!resizeReady) {
            return;
        }

        const link =
            document.createElement("a");

        link.download =
            `daksh-resized-${resizeCanvas.width}x${resizeCanvas.height}.jpg`;

        link.href =
            resizeCanvas.toDataURL(
                "image/jpeg",
                0.95
            );

        link.click();
    }
);


/*
 Resize panel को main Photo Tools box में रखें
*/

if (
    mainPhotoToolBox &&
    resizeToolPanel
) {
    mainPhotoToolBox.appendChild(
        resizeToolPanel
    );
}





/* ========================================
   PHOTO COMPRESS TOOL
======================================== */

const compressToolPanel =
    document.getElementById("compressToolPanel");

const compressQuality =
    document.getElementById("compressQuality");

const compressFormat =
    document.getElementById("compressFormat");

const generateCompressButton =
    document.getElementById("generateCompress");

const downloadCompressButton =
    document.getElementById("downloadCompress");

const compressInfo =
    document.getElementById("compressInfo");

const compressCanvas =
    document.getElementById("compressCanvas");

let compressReady = false;
let compressedBlob = null;


function formatFileSize(bytes) {

    if (!Number.isFinite(bytes) || bytes < 0) {
        return "0 KB";
    }

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(
        bytes / (1024 * 1024)
    ).toFixed(2)} MB`;
}


function getCompressSource() {

    if (
        resizeReady &&
        resizeCanvas.width > 0 &&
        resizeCanvas.height > 0
    ) {
        return resizeCanvas;
    }

    if (
        nameAddReady &&
        nameAddCanvas.width > 0 &&
        nameAddCanvas.height > 0
    ) {
        return nameAddCanvas;
    }

    if (
        outputCanvas &&
        outputCanvas.width > 0 &&
        outputCanvas.height > 0 &&
        removedBackgroundBlob
    ) {
        return outputCanvas;
    }

    return originalImage;
}


function canvasToBlobAsync(
    canvas,
    format,
    quality
) {
    return new Promise((resolve, reject) => {

        canvas.toBlob(
            (blob) => {

                if (!blob) {
                    reject(
                        new Error(
                            "Unable to create compressed image"
                        )
                    );
                    return;
                }

                resolve(blob);
            },
            format,
            quality
        );
    });
}


async function generateCompressedPhoto() {

    const source =
        getCompressSource();

    if (!source || !imageInput.files?.[0]) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    const width =
        source.naturalWidth ||
        source.width;

    const height =
        source.naturalHeight ||
        source.height;

    const quality =
        Number(compressQuality.value) || 0.85;

    const format =
        compressFormat.value ||
        "image/jpeg";

    generateCompressButton.disabled =
        true;

    downloadCompressButton.disabled =
        true;

    statusText.textContent =
        "Compressing photo...";

    try {

        compressCanvas.width =
            width;

        compressCanvas.height =
            height;

        const context =
            compressCanvas.getContext("2d");

        context.clearRect(
            0,
            0,
            width,
            height
        );

        /*
         JPEG/WebP transparency support नहीं होने पर
         white background रखें.
        */

        context.fillStyle =
            "#ffffff";

        context.fillRect(
            0,
            0,
            width,
            height
        );

        context.imageSmoothingEnabled =
            true;

        context.imageSmoothingQuality =
            "high";

        context.drawImage(
            source,
            0,
            0,
            width,
            height
        );

        compressedBlob =
            await canvasToBlobAsync(
                compressCanvas,
                format,
                quality
            );

        const originalBytes =
            imageInput.files[0].size;

        const compressedBytes =
            compressedBlob.size;

        const saving =
            originalBytes > 0
                ? (
                    (
                        originalBytes -
                        compressedBytes
                    ) /
                    originalBytes *
                    100
                  )
                : 0;

        compressReady = true;

        downloadCompressButton.disabled =
            false;

        compressInfo.textContent =
            `Original: ${formatFileSize(originalBytes)} | ` +
            `Compressed: ${formatFileSize(compressedBytes)} | ` +
            `Saving: ${Math.max(0, saving).toFixed(1)}%`;

        statusText.textContent =
            "Photo compressed successfully.";

    } catch (error) {

        console.error(
            "[Daksh Photo Workbench] Compress failed:",
            error
        );

        compressInfo.textContent =
            "Compression failed.";

        statusText.textContent =
            "Unable to compress photo.";

    } finally {

        generateCompressButton.disabled =
            false;
    }
}


generateCompressButton.addEventListener(
    "click",
    generateCompressedPhoto
);


downloadCompressButton.addEventListener(
    "click",
    () => {

        if (
            !compressReady ||
            !compressedBlob
        ) {
            return;
        }

        const extension =
            compressFormat.value === "image/webp"
                ? "webp"
                : "jpg";

        const url =
            URL.createObjectURL(
                compressedBlob
            );

        const link =
            document.createElement("a");

        link.download =
            `daksh-compressed-photo.${extension}`;

        link.href =
            url;

        link.click();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );
    }
);


/*
 Compress panel को main Photo Tools box में रखें
*/

if (
    mainPhotoToolBox &&
    compressToolPanel
) {
    mainPhotoToolBox.appendChild(
        compressToolPanel
    );
}



/* ========================================
   PHOTO CROP TOOL
======================================== */

const cropToolPanel =
    document.getElementById("cropToolPanel");

const cropRatio =
    document.getElementById("cropRatio");

const cropZoom =
    document.getElementById("cropZoom");

const cropPositionX =
    document.getElementById("cropPositionX");

const cropPositionY =
    document.getElementById("cropPositionY");

const generateCropButton =
    document.getElementById("generateCrop");

const downloadCropButton =
    document.getElementById("downloadCrop");

const cropInfo =
    document.getElementById("cropInfo");

const cropCanvas =
    document.getElementById("cropCanvas");

let cropReady = false;


function getCropSource() {

    if (
        compressReady &&
        compressCanvas.width > 0 &&
        compressCanvas.height > 0
    ) {
        return compressCanvas;
    }

    if (
        resizeReady &&
        resizeCanvas.width > 0 &&
        resizeCanvas.height > 0
    ) {
        return resizeCanvas;
    }

    if (
        nameAddReady &&
        nameAddCanvas.width > 0 &&
        nameAddCanvas.height > 0
    ) {
        return nameAddCanvas;
    }

    if (
        outputCanvas &&
        outputCanvas.width > 0 &&
        outputCanvas.height > 0 &&
        removedBackgroundBlob
    ) {
        return outputCanvas;
    }

    return originalImage;
}


function getCropRatioValue() {

    const value =
        cropRatio.value;

    if (value === "1:1") {
        return 1;
    }

    if (value === "35:45") {
        return 35 / 45;
    }

    if (value === "4:6") {
        return 4 / 6;
    }

    if (value === "16:9") {
        return 16 / 9;
    }

    return null;
}


function generateCroppedPhoto() {

    const source =
        getCropSource();

    if (!source) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    const sourceWidth =
        source.naturalWidth ||
        source.width;

    const sourceHeight =
        source.naturalHeight ||
        source.height;

    const ratio =
        getCropRatioValue();

    const zoom =
        Number(cropZoom.value) || 1;

    const positionX =
        Number(cropPositionX.value) / 100;

    const positionY =
        Number(cropPositionY.value) / 100;


    let cropWidth =
        sourceWidth / zoom;

    let cropHeight =
        sourceHeight / zoom;


    if (ratio) {

        const currentRatio =
            cropWidth / cropHeight;

        if (currentRatio > ratio) {
            cropWidth =
                cropHeight * ratio;
        } else {
            cropHeight =
                cropWidth / ratio;
        }
    }


    const maxX =
        sourceWidth - cropWidth;

    const maxY =
        sourceHeight - cropHeight;

    const sourceX =
        Math.max(
            0,
            Math.min(
                maxX,
                maxX * positionX
            )
        );

    const sourceY =
        Math.max(
            0,
            Math.min(
                maxY,
                maxY * positionY
            )
        );


    cropCanvas.width =
        Math.round(cropWidth);

    cropCanvas.height =
        Math.round(cropHeight);


    const context =
        cropCanvas.getContext("2d");

    context.clearRect(
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
    );

    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";

    context.drawImage(
        source,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
    );

    cropReady = true;

    downloadCropButton.disabled =
        false;

    cropInfo.textContent =
        `Cropped Size: ${cropCanvas.width} × ${cropCanvas.height} px`;

    statusText.textContent =
        "Photo cropped successfully.";
}


generateCropButton.addEventListener(
    "click",
    generateCroppedPhoto
);


cropZoom.addEventListener(
    "input",
    () => {
        if (cropReady) {
            generateCroppedPhoto();
        }
    }
);


cropPositionX.addEventListener(
    "input",
    () => {
        if (cropReady) {
            generateCroppedPhoto();
        }
    }
);


cropPositionY.addEventListener(
    "input",
    () => {
        if (cropReady) {
            generateCroppedPhoto();
        }
    }
);


cropRatio.addEventListener(
    "change",
    () => {
        if (cropReady) {
            generateCroppedPhoto();
        }
    }
);


downloadCropButton.addEventListener(
    "click",
    () => {

        if (!cropReady) {
            return;
        }

        const link =
            document.createElement("a");

        link.download =
            "daksh-cropped-photo.jpg";

        link.href =
            cropCanvas.toDataURL(
                "image/jpeg",
                0.95
            );

        link.click();
    }
);


/*
 Crop panel को main Photo Tools box में रखें
*/

if (
    mainPhotoToolBox &&
    cropToolPanel
) {
    mainPhotoToolBox.appendChild(
        cropToolPanel
    );
}



/* ========================================
   PHOTO FORMAT CONVERTER
======================================== */

const convertToolPanel =
    document.getElementById("convertToolPanel");

const convertFormat =
    document.getElementById("convertFormat");

const convertQuality =
    document.getElementById("convertQuality");

const convertBackground =
    document.getElementById("convertBackground");

const generateConvertButton =
    document.getElementById("generateConvert");

const downloadConvertButton =
    document.getElementById("downloadConvert");

const convertInfo =
    document.getElementById("convertInfo");

const convertCanvas =
    document.getElementById("convertCanvas");

let convertReady = false;
let convertedBlob = null;


function getConvertSource() {

    if (
        cropReady &&
        cropCanvas.width > 0 &&
        cropCanvas.height > 0
    ) {
        return cropCanvas;
    }

    if (
        compressReady &&
        compressCanvas.width > 0 &&
        compressCanvas.height > 0
    ) {
        return compressCanvas;
    }

    if (
        resizeReady &&
        resizeCanvas.width > 0 &&
        resizeCanvas.height > 0
    ) {
        return resizeCanvas;
    }

    if (
        nameAddReady &&
        nameAddCanvas.width > 0 &&
        nameAddCanvas.height > 0
    ) {
        return nameAddCanvas;
    }

    if (
        outputCanvas &&
        outputCanvas.width > 0 &&
        outputCanvas.height > 0 &&
        removedBackgroundBlob
    ) {
        return outputCanvas;
    }

    return originalImage;
}


async function generateConvertedPhoto() {

    const source =
        getConvertSource();

    if (!source) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    const width =
        source.naturalWidth ||
        source.width;

    const height =
        source.naturalHeight ||
        source.height;

    const format =
        convertFormat.value ||
        "image/jpeg";

    const quality =
        Number(convertQuality.value) || 0.95;

    convertCanvas.width =
        width;

    convertCanvas.height =
        height;

    const context =
        convertCanvas.getContext("2d");

    context.clearRect(
        0,
        0,
        width,
        height
    );

    /*
     JPG transparency support नहीं करता.
     इसलिए selected background fill करें.
    */

    if (format === "image/jpeg") {

        context.fillStyle =
            convertBackground.value === "black"
                ? "#000000"
                : "#ffffff";

        context.fillRect(
            0,
            0,
            width,
            height
        );
    }

    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";

    context.drawImage(
        source,
        0,
        0,
        width,
        height
    );

    try {

        convertedBlob =
            await canvasToBlobAsync(
                convertCanvas,
                format,
                quality
            );

        convertReady = true;

        downloadConvertButton.disabled =
            false;

        let label = "JPG";

        if (format === "image/png") {
            label = "PNG";
        }

        if (format === "image/webp") {
            label = "WebP";
        }

        convertInfo.textContent =
            `Output: ${label} | ` +
            `Size: ${formatFileSize(convertedBlob.size)} | ` +
            `${width} × ${height} px`;

        statusText.textContent =
            `Photo converted to ${label} successfully.`;

    } catch (error) {

        console.error(
            "[Daksh Photo Workbench] Convert failed:",
            error
        );

        convertReady = false;

        downloadConvertButton.disabled =
            true;

        convertInfo.textContent =
            "Conversion failed.";

        statusText.textContent =
            "Unable to convert photo.";
    }
}


generateConvertButton.addEventListener(
    "click",
    generateConvertedPhoto
);


convertFormat.addEventListener(
    "change",
    () => {

        /*
         PNG में quality/background की जरूरत नहीं.
        */

        const isPng =
            convertFormat.value === "image/png";

        convertQuality.disabled =
            isPng;

        convertBackground.disabled =
            convertFormat.value !== "image/jpeg";

        if (convertReady) {
            generateConvertedPhoto();
        }
    }
);


convertQuality.addEventListener(
    "change",
    () => {
        if (convertReady) {
            generateConvertedPhoto();
        }
    }
);


convertBackground.addEventListener(
    "change",
    () => {
        if (convertReady) {
            generateConvertedPhoto();
        }
    }
);


downloadConvertButton.addEventListener(
    "click",
    () => {

        if (
            !convertReady ||
            !convertedBlob
        ) {
            return;
        }

        let extension = "jpg";

        if (
            convertFormat.value === "image/png"
        ) {
            extension = "png";
        }

        if (
            convertFormat.value === "image/webp"
        ) {
            extension = "webp";
        }

        const url =
            URL.createObjectURL(
                convertedBlob
            );

        const link =
            document.createElement("a");

        link.download =
            `daksh-converted-photo.${extension}`;

        link.href =
            url;

        link.click();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );
    }
);


/*
 Converter panel को main Photo Tools box में रखें
*/

if (
    mainPhotoToolBox &&
    convertToolPanel
) {
    mainPhotoToolBox.appendChild(
        convertToolPanel
    );
}



/* ========================================
   PHOTO SIZE IN KB TOOL
======================================== */

const kbSizeToolPanel =
    document.getElementById("kbSizeToolPanel");

const kbSizeTarget =
    document.getElementById("kbSizeTarget");

const kbSizeCustom =
    document.getElementById("kbSizeCustom");

const kbSizeMinQuality =
    document.getElementById("kbSizeMinQuality");

const kbSizeFormat =
    document.getElementById("kbSizeFormat");

const generateKbSizeButton =
    document.getElementById("generateKbSize");

const downloadKbSizeButton =
    document.getElementById("downloadKbSize");

const kbSizeInfo =
    document.getElementById("kbSizeInfo");

const kbSizeCanvas =
    document.getElementById("kbSizeCanvas");

let kbSizeReady = false;
let kbSizeBlob = null;


function getKbSizeSource() {

    if (
        convertReady &&
        convertCanvas.width > 0 &&
        convertCanvas.height > 0
    ) {
        return convertCanvas;
    }

    if (
        cropReady &&
        cropCanvas.width > 0 &&
        cropCanvas.height > 0
    ) {
        return cropCanvas;
    }

    if (
        resizeReady &&
        resizeCanvas.width > 0 &&
        resizeCanvas.height > 0
    ) {
        return resizeCanvas;
    }

    if (
        nameAddReady &&
        nameAddCanvas.width > 0 &&
        nameAddCanvas.height > 0
    ) {
        return nameAddCanvas;
    }

    if (
        outputCanvas &&
        outputCanvas.width > 0 &&
        outputCanvas.height > 0 &&
        removedBackgroundBlob
    ) {
        return outputCanvas;
    }

    return originalImage;
}


function getTargetKbValue() {

    if (kbSizeTarget.value === "custom") {

        const custom =
            Number(kbSizeCustom.value);

        if (
            !custom ||
            custom < 5 ||
            custom > 5000
        ) {
            return null;
        }

        return custom;
    }

    return Number(kbSizeTarget.value);
}




async function prepareKbSizedPhoto() {

    const source =
        getKbSizeSource();

    if (!source) {
        statusText.textContent =
            "Please select a photo first.";
        return;
    }

    const targetKb =
        getTargetKbValue();

    if (!targetKb) {
        statusText.textContent =
            "Please enter a valid target KB.";
        return;
    }

    const targetBytes =
        targetKb * 1024;

    /*
     Final output हमेशा limit के थोड़ा नीचे रखें.
    */
    const safeTargetBytes =
        targetBytes * 0.995;

    const minimumQuality =
        Number(kbSizeMinQuality.value) || 0.50;

    const maximumQuality =
        0.98;

    const format =
        kbSizeFormat.value || "image/jpeg";

    const sourceWidth =
        source.naturalWidth ||
        source.width;

    const sourceHeight =
        source.naturalHeight ||
        source.height;

    let currentWidth =
        sourceWidth;

    let currentHeight =
        sourceHeight;

    let finalBlob = null;
    let finalQuality = null;
    let finalWidth = null;
    let finalHeight = null;

    generateKbSizeButton.disabled =
        true;

    downloadKbSizeButton.disabled =
        true;

    kbSizeReady =
        false;

    kbSizeBlob =
        null;

    statusText.textContent =
        `Preparing photo close to ${targetKb} KB...`;

    try {

        /*
         पहले dimensions optimize होंगे,
         फिर quality binary-search होगी.
        */

        for (
            let round = 0;
            round < 18;
            round++
        ) {

            currentWidth =
                Math.max(
                    180,
                    Math.round(currentWidth)
                );

            currentHeight =
                Math.max(
                    180,
                    Math.round(currentHeight)
                );

            kbSizeCanvas.width =
                currentWidth;

            kbSizeCanvas.height =
                currentHeight;

            const context =
                kbSizeCanvas.getContext("2d");

            context.clearRect(
                0,
                0,
                currentWidth,
                currentHeight
            );

            /*
             JPG/WebP के लिए white base.
            */

            context.fillStyle =
                "#ffffff";

            context.fillRect(
                0,
                0,
                currentWidth,
                currentHeight
            );

            context.imageSmoothingEnabled =
                true;

            context.imageSmoothingQuality =
                "high";

            context.drawImage(
                source,
                0,
                0,
                currentWidth,
                currentHeight
            );


            /*
             पहले minimum और maximum quality
             पर actual file size देखें.
            */

            const lowBlob =
                await canvasToBlobAsync(
                    kbSizeCanvas,
                    format,
                    minimumQuality
                );

            const highBlob =
                await canvasToBlobAsync(
                    kbSizeCanvas,
                    format,
                    maximumQuality
                );


            /*
             Minimum quality पर भी file बड़ी है:
             dimensions proportion के अनुसार घटाएँ.
            */

            if (
                lowBlob.size >
                safeTargetBytes
            ) {

                let scale =
                    Math.sqrt(
                        safeTargetBytes /
                        lowBlob.size
                    ) * 0.97;

                scale =
                    Math.max(
                        0.55,
                        Math.min(
                            0.94,
                            scale
                        )
                    );

                currentWidth *=
                    scale;

                currentHeight *=
                    scale;

                continue;
            }


            /*
             Maximum quality पर भी target से
             काफी कम है और dimensions पहले घट चुके हैं,
             तो dimensions थोड़ा वापस बढ़ाएँ.
            */

            if (
                highBlob.size <
                    safeTargetBytes * 0.88 &&
                currentWidth < sourceWidth &&
                currentHeight < sourceHeight
            ) {

                let scaleUp =
                    Math.sqrt(
                        safeTargetBytes /
                        Math.max(
                            1,
                            highBlob.size
                        )
                    ) * 0.98;

                scaleUp =
                    Math.min(
                        1.18,
                        scaleUp
                    );

                const nextWidth =
                    Math.min(
                        sourceWidth,
                        Math.round(
                            currentWidth *
                            scaleUp
                        )
                    );

                const nextHeight =
                    Math.min(
                        sourceHeight,
                        Math.round(
                            currentHeight *
                            scaleUp
                        )
                    );

                if (
                    nextWidth >
                        currentWidth + 5 ||
                    nextHeight >
                        currentHeight + 5
                ) {

                    currentWidth =
                        nextWidth;

                    currentHeight =
                        nextHeight;

                    continue;
                }
            }


            /*
             यदि full/high quality ही target के नीचे है
             तो वही best possible result है.
            */

            if (
                highBlob.size <=
                safeTargetBytes
            ) {

                finalBlob =
                    highBlob;

                finalQuality =
                    maximumQuality;

                finalWidth =
                    currentWidth;

                finalHeight =
                    currentHeight;

                break;
            }


            /*
             अब सही quality binary search करें.
             लक्ष्य: सबसे ज्यादा quality जो
             target KB से ऊपर न जाए.
            */

            let low =
                minimumQuality;

            let high =
                maximumQuality;

            let bestBlob =
                lowBlob;

            let bestQuality =
                minimumQuality;

            for (
                let attempt = 0;
                attempt < 16;
                attempt++
            ) {

                const quality =
                    (low + high) / 2;

                const blob =
                    await canvasToBlobAsync(
                        kbSizeCanvas,
                        format,
                        quality
                    );

                if (
                    blob.size <=
                    safeTargetBytes
                ) {

                    /*
                     Under target:
                     इसे save करें और quality बढ़ाएँ.
                    */

                    if (
                        !bestBlob ||
                        blob.size >
                        bestBlob.size
                    ) {
                        bestBlob =
                            blob;

                        bestQuality =
                            quality;
                    }

                    low =
                        quality;

                } else {

                    /*
                     Over target:
                     quality घटाएँ.
                    */

                    high =
                        quality;
                }
            }


            finalBlob =
                bestBlob;

            finalQuality =
                bestQuality;

            finalWidth =
                currentWidth;

            finalHeight =
                currentHeight;

            break;
        }


        if (!finalBlob) {
            throw new Error(
                "Unable to create photo within KB limit."
            );
        }


        /*
         अंतिम सुरक्षा:
         target से ऊपर result कभी स्वीकार नहीं होगा.
        */

        if (
            finalBlob.size >
            targetBytes
        ) {
            throw new Error(
                "Generated file exceeded target KB."
            );
        }


        kbSizeBlob =
            finalBlob;

        kbSizeReady =
            true;

        downloadKbSizeButton.disabled =
            false;

        const actualKb =
            finalBlob.size / 1024;

        const usedPercent =
            (
                actualKb /
                targetKb *
                100
            ).toFixed(1);

        kbSizeInfo.textContent =
            `Limit: ${targetKb} KB | ` +
            `Output: ${actualKb.toFixed(1)} KB | ` +
            `Used: ${usedPercent}% | ` +
            `Resolution: ${finalWidth} × ${finalHeight} px | ` +
            `Quality: ${Math.round(finalQuality * 100)}%`;

        statusText.textContent =
            `Photo prepared successfully under ${targetKb} KB.`;

    } catch (error) {

        console.error(
            "[Daksh Photo Workbench] Accurate KB sizing failed:",
            error
        );

        kbSizeReady =
            false;

        kbSizeBlob =
            null;

        downloadKbSizeButton.disabled =
            true;

        kbSizeInfo.textContent =
            "Unable to prepare photo within the selected KB limit.";

        statusText.textContent =
            "KB size processing failed.";

    } finally {

        generateKbSizeButton.disabled =
            false;
    }
}


kbSizeTarget.addEventListener(
    "change",
    () => {

        kbSizeCustom.disabled =
            kbSizeTarget.value !== "custom";
    }
);


generateKbSizeButton.addEventListener(
    "click",
    prepareKbSizedPhoto
);


downloadKbSizeButton.addEventListener(
    "click",
    () => {

        if (
            !kbSizeReady ||
            !kbSizeBlob
        ) {
            return;
        }

        const extension =
            kbSizeFormat.value === "image/webp"
                ? "webp"
                : "jpg";

        const url =
            URL.createObjectURL(
                kbSizeBlob
            );

        const link =
            document.createElement("a");

        link.download =
            `daksh-${getTargetKbValue()}kb-photo.${extension}`;

        link.href =
            url;

        link.click();

        setTimeout(
            () => URL.revokeObjectURL(url),
            1000
        );
    }
);


/*
 KB Size panel को main Photo Tools box में रखें
*/

if (
    mainPhotoToolBox &&
    kbSizeToolPanel
) {
    mainPhotoToolBox.appendChild(
        kbSizeToolPanel
    );
}




/* ========================================
   FINAL PHOTO TOOLS DOM ORDER
======================================== */

/*
 Final order:

 Photo upload / preview
 Tool cards
 Selected processing panel
*/

if (
    mainPhotoToolBox &&
    photoActionPanel
) {

    /*
     appendChild existing element को duplicate
     नहीं करता; उसे सही जगह move करता है.
    */

    mainPhotoToolBox.appendChild(
        photoActionPanel
    );

    const dakshPhotoToolPanels = [
        backgroundActionPanel,
        passportToolPanel,
        fourBySixToolPanel,
        nameAddToolPanel,
        resizeToolPanel,
        compressToolPanel,
        cropToolPanel,
        convertToolPanel,
        kbSizeToolPanel
    ];

    dakshPhotoToolPanels.forEach(
        (panel) => {

            if (panel) {
                mainPhotoToolBox.appendChild(
                    panel
                );
            }
        }
    );
}





// ========================================
// PHOTO TOOL URL ROUTING
// ========================================

(function openPhotoToolFromUrl() {

    const params =
        new URLSearchParams(window.location.search);

    const requestedTool =
        (params.get("tool") || "").trim().toLowerCase();

    if (!requestedTool) {
        return;
    }

    const toolMap = {
        "background": "background",
        "passport": "passport",
        "4x6": "four-by-six",
        "four-by-six": "four-by-six",
        "name-add": "name-add",
        "resize": "resize",
        "compress": "compress",
        "crop": "crop",
        "convert": "convert",
        "kb": "kb-size",
        "kb-size": "kb-size"
    };

    const action = toolMap[requestedTool];

    if (!action) {
        return;
    }

    const button = Array.from(
        document.querySelectorAll("[data-action]")
    ).find(
        item => item.dataset.action === action
    );

    if (!button) {
        console.warn(
            "[Daksh Photo Tools] Tool button not found:",
            action
        );
        return;
    }

    button.click();

    setTimeout(() => {
        button.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }, 100);

})();
