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

  // pdf-workbench.js may temporarily move processing panels near the old
  // hidden action chooser. After activation, always place the selected
  // processing panel back inside the workbench so it appears on the right.
  window.setTimeout(() => {
    const button = document.querySelector(config.selector);
    if (button) button.click();

    window.setTimeout(() => {
      if (!shell) return;

      allPanels.forEach((id) => {
        const panel = document.getElementById(id);
        if (panel) panel.hidden = id !== config.panel;
      });

      const activePanel = document.getElementById(config.panel);
      if (activePanel) {
        activePanel.hidden = false;
        shell.appendChild(activePanel);
      }

      shell.dataset.activeTool = requested;
    }, 0);
  }, 80);
});
