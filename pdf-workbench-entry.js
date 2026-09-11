"use strict";

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("tool") || "image-to-pdf";

  const map = {
    "image-to-pdf": {
      selector: '[data-pdf-action="image-to-pdf"]',
      panel: "imageToPdfPanel",
      title: "JPG to PDF",
      description: "Convert JPG / PNG images to PDF in seconds. Adjust page size and image fit as needed."
    },
    "merge": {
      selector: '[data-pdf-action="merge"]',
      panel: "mergePdfPanel",
      title: "Merge PDF",
      description: "Combine multiple PDF files into one PDF and arrange them in the required order."
    },
    "split": {
      selector: '[data-pdf-action="split"]',
      panel: "splitPdfPanel",
      title: "Split PDF",
      description: "Select and extract required pages from a PDF."
    },
    "resize-kb": {
      selector: '[data-pdf-action="resize-kb"]',
      panel: "resizePdfKbPanel",
      title: "Resize PDF in KB",
      description: "Reduce the actual downloaded PDF file size close to the required KB limit."
    },
    "pdf-to-image": {
      selector: '[data-pdf-action="pdf-to-image"]',
      panel: "pdfToImagesPanel",
      title: "PDF to Images",
      description: "Convert PDF pages into JPG or PNG images."
    },
    "remove-pages": {
      selector: '[data-pdf-action="remove-pages"]',
      panel: "removePagesPanel",
      title: "Remove PDF Pages",
      description: "Remove unwanted pages and download a new PDF."
    },
    "rotate": {
      selector: '[data-pdf-action="rotate"]',
      panel: "rotatePagesPanel",
      title: "Rotate PDF Pages",
      description: "Rotate selected PDF pages without changing the original page quality."
    },
    "reorder": {
      selector: '[data-pdf-action="reorder"]',
      panel: "reorderPagesPanel",
      title: "Reorder PDF Pages",
      description: "Drag and arrange PDF pages in a new order."
    }
  };

  const config = map[requested] || map["image-to-pdf"];
  const shell = document.querySelector(".pdf-workbench-shell");
  const actionPanel = document.getElementById("pdfActionPanel");
  const allPanels = [
    "mergePdfPanel",
    "splitPdfPanel",
    "resizePdfKbPanel",
    "imageToPdfPanel",
    "pdfToImagesPanel",
    "removePagesPanel",
    "rotatePagesPanel",
    "reorderPagesPanel"
  ];

  const hero = document.querySelector(".listing-hero");
  if (hero) {
    const label = hero.querySelector(".listing-label");
    const heading = hero.querySelector("h1");
    const paragraph = hero.querySelector("p");
    if (label) label.textContent = "PDF UTILITY TOOL";
    if (heading) heading.textContent = config.title;
    if (paragraph) paragraph.textContent = config.description;
  }

  document.querySelectorAll(".tool-nav-inner a").forEach((link) => {
    link.classList.toggle("active", link.href.includes(`tool=${requested}`));
  });

  if (shell && actionPanel && actionPanel.parentElement !== shell) {
    shell.appendChild(actionPanel);
  }

  const enforceImageToPdfLayout = () => {
    if (!shell || requested !== "image-to-pdf") return;

    const upload = shell.querySelector(":scope > .background-tool-controls");
    const previewArea = shell.querySelector(":scope > .background-preview-area");
    const previewBox = document.getElementById("pdfMainPreview");
    const panel = document.getElementById("imageToPdfPanel");
    const fileList = document.getElementById("imageToPdfList");

    shell.style.setProperty("display", "grid", "important");
    shell.style.setProperty("grid-template-columns", "minmax(0, 1fr) 360px", "important");
    shell.style.setProperty("grid-template-rows", "auto minmax(420px, auto)", "important");

    if (upload) {
      upload.style.setProperty("grid-column", "1 / -1", "important");
      upload.style.setProperty("grid-row", "1", "important");
    }

    if (previewArea) {
      previewArea.style.setProperty("grid-column", "1", "important");
      previewArea.style.setProperty("grid-row", "2", "important");
      previewArea.style.setProperty("min-width", "0", "important");
      previewArea.style.setProperty("overflow", "hidden", "important");
    }

    if (panel) {
      panel.hidden = false;
      panel.style.setProperty("grid-column", "2", "important");
      panel.style.setProperty("grid-row", "2", "important");
      panel.style.setProperty("grid-area", "auto", "important");
      panel.style.setProperty("position", "static", "important");
      panel.style.setProperty("width", "100%", "important");
      panel.style.setProperty("max-width", "360px", "important");
      panel.style.setProperty("min-width", "0", "important");
      panel.style.setProperty("margin", "0", "important");
      panel.style.setProperty("transform", "none", "important");
      panel.style.setProperty("float", "none", "important");
      panel.style.setProperty("overflow", "auto", "important");
    }

    if (previewBox) {
      previewBox.style.setProperty("width", "100%", "important");
      previewBox.style.setProperty("max-width", "100%", "important");
      previewBox.style.setProperty("overflow", "auto", "important");
      previewBox.style.setProperty("align-items", "flex-start", "important");
      previewBox.style.setProperty("justify-content", "flex-start", "important");

      const grid = previewBox.querySelector(".pdf-image-preview-grid");
      if (grid) {
        grid.style.setProperty("display", "grid", "important");
        grid.style.setProperty("grid-template-columns", "repeat(auto-fill, minmax(115px, 135px))", "important");
        grid.style.setProperty("gap", "12px", "important");
        grid.style.setProperty("align-items", "start", "important");
        grid.style.setProperty("width", "100%", "important");
      }

      previewBox.querySelectorAll(".pdf-image-preview-card").forEach((card) => {
        card.style.setProperty("position", "relative", "important");
        card.style.setProperty("width", "132px", "important");
        card.style.setProperty("max-width", "132px", "important");
        card.style.setProperty("min-height", "150px", "important");
        card.style.setProperty("margin", "0", "important");
        card.style.setProperty("transform", "none", "important");
        card.style.setProperty("float", "none", "important");
      });
    }

    if (fileList) {
      fileList.style.setProperty("display", "none", "important");
    }
  };

  const normalizeActivePanel = () => {
    if (!shell) return;

    allPanels.forEach((id) => {
      const panel = document.getElementById(id);
      if (panel) panel.hidden = id !== config.panel;
    });

    const activePanel = document.getElementById(config.panel);
    if (activePanel) {
      activePanel.hidden = false;
      if (actionPanel && actionPanel.parentElement === shell) {
        shell.insertBefore(activePanel, actionPanel);
      } else if (activePanel.parentElement !== shell) {
        shell.appendChild(activePanel);
      }
    }

    shell.dataset.activeTool = requested;
    enforceImageToPdfLayout();
  };

  window.setTimeout(() => {
    const button = document.querySelector(config.selector);
    if (button) button.click();
    window.setTimeout(normalizeActivePanel, 0);
    window.setTimeout(normalizeActivePanel, 120);
  }, 80);

  if (requested === "image-to-pdf") {
    const input = document.getElementById("pdfMainInput");
    const previewBox = document.getElementById("pdfMainPreview");

    if (input) {
      input.addEventListener("change", () => {
        window.setTimeout(enforceImageToPdfLayout, 0);
        window.setTimeout(enforceImageToPdfLayout, 100);
      });
    }

    if (previewBox) {
      const observer = new MutationObserver(() => {
        window.setTimeout(enforceImageToPdfLayout, 0);
      });
      observer.observe(previewBox, { childList: true, subtree: true });
    }
  }
});
