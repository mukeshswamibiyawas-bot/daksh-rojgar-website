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

        /*
         Next steps में हर action की
         actual functionality जोड़ी जाएगी।
        */
    });
});




/* ========================================
   AI BACKGROUND REMOVAL + COLOR APPLY
======================================== */

const colorButtons =
    document.querySelectorAll(".background-color-button");

const customColorInput =
    document.getElementById("customBackgroundColor");

const outputCanvas =
    document.getElementById("backgroundCanvas");

let selectedBackgroundColor = "#ffffff";
let removedBackgroundBlob = null;
let processingBackground = false;


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
        "Removing background with AI... Please wait.";

    try {

        if (!removedBackgroundBlob) {

            removedBackgroundBlob =
                await removeBackground(
                    imageInput.files[0],
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

            previewBox.innerHTML = "";

            const previewImage =
                document.createElement("img");

            previewImage.src = previewUrl;
            previewImage.alt =
                "Background changed preview";

            previewBox.appendChild(previewImage);

            downloadButton.disabled = false;

            statusText.textContent =
                "Background changed successfully.";

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
            "Background removal failed. Please try another photo.";

        processingBackground = false;
    }
}


colorButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        colorButtons.forEach((item) => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        selectedBackgroundColor =
            button.dataset.color || "#ffffff";

        await processBackground();
    });
});


if (customColorInput) {

    customColorInput.addEventListener(
        "input",
        async () => {

            colorButtons.forEach((item) => {
                item.classList.remove("active");
            });

            selectedBackgroundColor =
                customColorInput.value;

            await processBackground();
        }
    );
}


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
        "daksh-background-photo.jpg";

    link.href =
        outputCanvas.toDataURL(
            "image/jpeg",
            0.95
        );

    link.click();
});

