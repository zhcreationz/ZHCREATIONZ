/* =========================================
ZHCREATIONZ — WEBSITE FUNCTIONALITY
========================================= */

/* ---------- CURRENT YEAR ---------- */

const yearElement = document.getElementById("current-year");

if (yearElement) {
yearElement.textContent = new Date().getFullYear();
}

/* ---------- SCROLL REVEAL ANIMATIONS ---------- */

const reducedMotion = window.matchMedia(
"(prefers-reduced-motion: reduce)"
).matches;

const revealElements = document.querySelectorAll(
".intro, .section-heading, .product-card, .about, .contact"
);

if ("IntersectionObserver" in window && !reducedMotion) {
const revealObserver = new IntersectionObserver(
(entries, observer) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
entry.target.classList.add("visible");
observer.unobserve(entry.target);
}
});
},
{
threshold: 0.12,
rootMargin: "0px 0px -30px 0px"
}
);

revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
});

} else {
revealElements.forEach((element) => {
element.classList.add("visible");
});
}



/* ---------- WHATSAPP BUTTON CHECK ---------- */

/*
The HTML must contain your real WhatsApp number
in each wa.me link. Replace 91YOURNUMBER first.
*/

document.querySelectorAll('a[href*="wa.me"]').forEach((link) => {
link.addEventListener("click", (event) => {
if (link.href.includes("YOURNUMBER")) {
event.preventDefault();
alert(
"Please replace YOURNUMBER in the WhatsApp links " +
"with your WhatsApp number, including the country code."
);
}
});
});
const menuToggle = document.getElementById("menuToggle");
const closeMenu = document.getElementById("closeMenu");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("sidebarOverlay");

function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
}

function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
}

menuToggle.addEventListener("click", openSidebar);
closeMenu.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);

document.querySelectorAll(".sidebar a").forEach(link => {
    link.addEventListener("click", closeSidebar);
});