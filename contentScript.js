const dialogs = "app-nevelesi-naptar-dialog, app-csoport-naplo-dialog";
const darkClass = "dark";
const addCopyButtonId = "addCopyToWeekButton";
const requiredClasses = ["cdk-overlay-backdrop", "cdk-overlay-dark-backdrop", "cdk-overlay-backdrop-showing"];
let darkMode = false;
let dialogIsOpen = false;

document.title = "Zsír!Kréta";

document.addEventListener("click", async (event) => {
    const target = event.target;
    const spanElement = target.tagName === "SPAN" ? target : target.querySelector("span");
    const spanText = spanElement ? spanElement.innerText : "";
    const isButtonOrSpan = target.tagName === "BUTTON" || target.tagName === "SPAN";
    const isRelevantText = spanText.includes("Új esemény felvitele") || spanText.includes("Új csoportnapló bejegyzés hozzáadása");
    if (isButtonOrSpan) {
        if (spanText.includes("Mégse")) {
            closeDialog();
            return;
        }
        if (isRelevantText) {
            await handleDialogOpen();
        }
        if (darkMode && target.tagName === "BUTTON" && target.parentElement?.classList.contains("fc-button-group")) {
            applyDarkModeToTable();
        }
    }
});

async function handleDialogOpen() {
    dialogIsOpen = true;
    const dialog = document.querySelector(dialogs);
    if (darkMode && dialog) {
        applyDarkMode(dialog);
    }
    if (await getChromeStorageValue("closeOnOutsideClick")) {
        document.addEventListener("click", overlayClickHandler);
    }
    if (await getChromeStorageValue("addCopyToWeekbtn")) {
        createAddCopyToWeekButton();
    }
}

function closeDialog() {
    const dialog = document.querySelector(dialogs);
    if (dialog) {
        dialogIsOpen = false;
        dialog.remove();
    }
    const addCopyToWeekButton = document.getElementById(addCopyButtonId);
    if (addCopyToWeekButton) {
        addCopyToWeekButton.remove();
    }
}

function overlayClickHandler(event) {
    const overlayTarget = event.target;
    if (overlayTarget.tagName === "DIV" && requiredClasses.every(cls => overlayTarget.classList.contains(cls))) {
        closeDialog();
        overlayTarget.remove();
        document.removeEventListener("click", overlayClickHandler);
    }
}

function createAddCopyToWeekButton() {
    const addCopyToWeekButton = document.createElement("button");
    addCopyToWeekButton.innerText = "Beillesztés a hét minden napjára";
    addCopyToWeekButton.id = addCopyButtonId;
    addCopyToWeekButton.addEventListener("click", () => {
        console.log("Naplózás beillesztése egész hétre");
    });
    document.body.appendChild(addCopyToWeekButton);
}

function getChromeStorageValue(key) {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], (result) => {
            resolve(result[key]);
        });
    });
}

async function initialize() {
    console.log("Zsír!Kréta inicializálása...");
    const useDefIcons = await getChromeStorageValue("useDefaultIcon");
    if (!useDefIcons) {
        updateFavicons();
    }
    const calendar = Array.from(document.querySelectorAll("mat-card")).find(section => section.querySelector("h1").innerText.includes("Naptár"));
    darkMode = await getChromeStorageValue("darkMode");
    if (darkMode) {
        applyGlobalDarkMode();
    }
    const welcomeCard = document.querySelector("app-welcome-card");
    if (welcomeCard && await getChromeStorageValue("removeWelcomeCard")) {
        removeWelcomeCard(welcomeCard, calendar);
    }
    const footer = document.querySelector("footer");
    if (footer) {
        const eduDevZrt = footer.querySelector("div a");
        if (eduDevZrt) {
            const div = eduDevZrt.parentElement;
            const newElement = document.createElement("a");
            newElement.href = "https://smmest3r.dev";
            newElement.target = "_blank";
            newElement.innerText = "SMmest3r.dev";
            div.appendChild(newElement);
            eduDevZrt.style.marginRight = "2.5rem";
        }
    }
}

function updateFavicons() {
    const faviconLinks = document.querySelectorAll("link[rel='icon'], link[rel='apple-touch-icon']");
    faviconLinks.forEach(link => {
        link.href = chrome.runtime.getURL("icons/icon128.png");
    });
}

function applyDarkMode(dialog) {
    dialog.parentElement.classList.add(darkClass);
    dialog.querySelectorAll("div label, div span span").forEach(element => element.classList.add(darkClass));
    dialog.querySelectorAll("mat-checkbox label span span").forEach(label => label.classList.remove(darkClass));
}

function applyGlobalDarkMode() {
    document.querySelectorAll('*').forEach(element => {
        if (!["cdk-overlay-container", "cdk-overlay-backdrop", "cdk-global-overlay-wrapper"].some(cls => element.classList.contains(cls)) && element.tagName.toLowerCase() !== 'svg') {
            element.classList.add(darkClass);
        }
    });
    const nav = document.querySelector("nav");
    if (nav) {
        nav.classList.remove(darkClass);
        nav.querySelectorAll("*").forEach(element => element.classList.remove(darkClass));
    }
    document.querySelectorAll("button, span, mat-checkbox").forEach(element => {
        element.classList.remove(darkClass);
        element.querySelector("mat-icon")?.classList.remove(darkClass);
    });
    const div = document.querySelector("div.d-flex.align-items-center.dark");
    if (div) {
        div.classList.remove(darkClass);
        div.querySelector("mat-form-field").style.backgroundColor = "#0097C1";
        div.querySelectorAll("*").forEach(child => {
            child.classList.remove(darkClass);
            child.style.color = "white";
        });
    }
}

function removeWelcomeCard(welcomeCard, calendar) {
    welcomeCard.remove();
    if (calendar) {
        const parent = calendar.parentElement;
        const grandParent = parent.parentElement;
        grandParent.style.display = "flex";
        parent.style.flexGrow = "1";
        calendar.style.flexGrow = "1";
    }
}

function waitForWelcomeCard() {
    const observer = new MutationObserver((mutations, obs) => {
        if (document.querySelector("app-welcome-card")) {
            initialize();
            obs.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function applyDarkModeToTable() {
    const table = document.querySelector("table");
    if (table) {
        table.querySelectorAll("th").forEach(th => {
            th.classList.add(darkClass);
            th.querySelector("a")?.classList.add(darkClass);
        });
    }
}

waitForWelcomeCard();