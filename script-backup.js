"use strict";

const menuButton = document.getElementById("menuButton");
const mainNav = document.getElementById("mainNav");
const currentYear = document.getElementById("currentYear");

if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

if (menuButton && mainNav) {
    menuButton.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });

    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("open");
        });
    });
}