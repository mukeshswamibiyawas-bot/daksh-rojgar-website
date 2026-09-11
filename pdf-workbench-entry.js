"use strict";

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("tool") || "image-to-pdf";

  const map = {
    "image-to-pdf": {
      selector: '[data-pdf-action="image-to-pdf"]',
      title: "JPG to PDF",
      description: "Convert JPG / PNG images to PDF in seconds. Adjust page size and image fit as needed."
    },
    "merge": {
      selector: '[data-pdf-action="merge"]',
      title: "Merge PDF",
      description: "Combine multiple PDF files into one PDF and arrange them in the required order."
    },
    "split": {
      selector: '[data-pdf-action="split"]',
      title: "Split PDF",
      description: "Select and extract required pages from a PDF."
    },
    "resize-kb": {
      selector: '[data-pdf-action="resize-kb"]',
      title: "Resize PDF in KB",
      description: "Reduce the actual downloaded PDF file size close to the required KB limit."
    },
    "pdf-to-image": {
      selector: '[data-pdf-action="pdf-to-image"]',
      title: "PDF to Images",
      description: "Convert PDF pages into JPG or PNG images."
    },
    "remove-pages": {
      selector: '[data-pdf-action="remove-pages"]',
      title: "Remove PDF Pages",
      description: "Remove unwanted pages and download a new PDF."
    },
    "rotate": {
      selector: '[data-pdf-action="rotate"]',
      title: "Rotate PDF Pages",
      description: "Rotate selected PDF pages without changing the original page quality."
    },
    "reorder": {
      selector: '[data-pdf-action="reorder"]',
      title: "Reorder PDF Pages",
      description: "Drag and arrange PDF pages in a new order."
    }
  };

  const config = map[requested] || map["image-to-pdf"];
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

  // pdf-workbench.js resets panels on DOMContentLoaded. Run after that reset.
  window.setTimeout(() => {
    const button = document.querySelector(config.selector);
    if (button) button.click();
  }, 80);
});
