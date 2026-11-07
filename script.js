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

/* ---------- SEASONAL COLLECTIONS ---------- */

/*
Add seasonal collections here.

Dates use YYYY-MM-DD.
The start date and end date are both included.

Set active: false to hide a collection.

Replace example product information with your real products.
*/

const seasonalCollections = [
{
name: "Christmas Collection",
description: "Thoughtful gifts for a magical Christmas.",
startDate: "2026-12-01",
endDate: "2026-12-31",
active: true,
products: [
{
name: "Christmas Gift Hampers",
description: "Special gifts for the festive season.",
image: "images/gifts/christmas-hamper.jpg"
},
{
name: "Christmas Personalised Gifts",
description: "Personalised surprises for loved ones.",
image: "images/gifts/christmas-gifts.jpg"
}
]
},

{
    name: "Onam Collection",
    description: "Celebrate Onam with thoughtful creations.",
    startDate: "2027-08-15",
    endDate: "2027-09-15",
    active: true,
    products: [
        {
            name: "Onam Gift Hampers",
            description: "Festive gifts prepared with care.",
            image: "images/gifts/onam-hamper.jpg"
        }
    ]
}

];

/* ---------- DATE HELPERS ---------- */

/*
Parse calendar dates consistently as UTC dates.
This avoids dates shifting due to local timezone differences.
*/

function parseCalendarDate(dateString) {
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
return null;
}

const [year, month, day] = dateString.split("-").map(Number);
const date = new Date(Date.UTC(year, month - 1, day));

if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
) {
    return null;
}

return date;

}

function isCollectionAvailable(collection, today) {
const start = parseCalendarDate(collection.startDate);
const end = parseCalendarDate(collection.endDate);

if (!collection.active || !start || !end || start > end) {
    return false;
}

return today >= start && today <= end;

}

/* ---------- RENDER SEASONAL COLLECTIONS ---------- */

function displaySeasonalCollections() {
const section = document.getElementById("seasonal");
const title = document.getElementById("seasonal-title");
const description = document.getElementById("seasonal-description");
const productContainer = document.getElementById("seasonal-products");

if (!section || !title || !description || !productContainer) {
    return;
}

const now = new Date();

const today = new Date(Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
));

const availableCollections = seasonalCollections.filter(
    (collection) => isCollectionAvailable(collection, today)
);

productContainer.replaceChildren();

if (availableCollections.length === 0) {
    section.hidden = true;
    return;
}

section.hidden = false;

availableCollections.forEach((collection) => {
    title.textContent = collection.name;
    description.textContent = collection.description;

    (collection.products || []).forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";

        const placeholder = document.createElement("div");
        placeholder.className = "product-placeholder";

        if (product.image) {
            const image = document.createElement("img");
            image.src = product.image;
            image.alt = product.name || "Seasonal product";
            image.loading = "lazy";

            image.addEventListener("error", () => {
                placeholder.textContent = "Seasonal";
                image.remove();
            }, { once: true });

            placeholder.appendChild(image);
        } else {
            placeholder.textContent = "Seasonal";
        }

        const productName = document.createElement("h3");
        productName.textContent = product.name || "Seasonal Product";

        const productDescription = document.createElement("p");
        productDescription.textContent = product.description || "";

        const orderLink = document.createElement("a");
        orderLink.className = "button";
        orderLink.href = "#contact";
        orderLink.textContent = "Enquire Now";

        card.append(placeholder, productName, productDescription, orderLink);
        productContainer.appendChild(card);

        if (!reducedMotion) {
            card.classList.add("reveal");
            requestAnimationFrame(() => {
                card.classList.add("visible");
            });
        }
    });
});

}

displaySeasonalCollections();

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