import React from "dom-chef";
import { ElementFinder } from "./utils/elementFinder";
import { BrowserStorage } from "./utils/storage";
import NotInterestedIcon from "./images/not-interested.svg";

function hideEntryIfNotVisible(entry: HTMLElement): void {
    if (!isVisibleCache)
        entry.style.display = "none";
}

function makeNotInterestedStatusButton(watchStatusButton: HTMLElement): void {
    watchStatusButton.classList.add(ElementFinder.notInterestedStatusClass);
    watchStatusButton.textContent = "Not interested";
}

function onNotInterestedClick(target: EventTarget, entry: HTMLElement): void {
    const notInterestedButton = target as HTMLButtonElement;
    const parent = notInterestedButton.parentNode as HTMLElement;
    const watchStatusButton = ElementFinder.findWatchStatusButton(parent);
    const name = ElementFinder.findEntryName(entry);

    makeNotInterestedStatusButton(watchStatusButton);
    notInterestedButton.style.display = "none";
    hideEntryIfNotVisible(entry);
    BrowserStorage.addIgnoredName(name);
}

function initTopTable(): void {
    if (!ElementFinder.isTopTablePage() || isInitialized)
        return;

    ElementFinder.forTopTableEntryStatusButtons((statusButton, isNotWatched, buttonParent, entry) => {
        isInitialized = true;

        if (!isNotWatched) {
            hideEntryIfNotVisible(entry);
            return;
        }

        const name = ElementFinder.findEntryName(entry);
        if (ignoredNamesCache.has(name)) {
            makeNotInterestedStatusButton(statusButton);
            hideEntryIfNotVisible(entry);
            return;
        }

        buttonParent.appendChild(
            <button className="not-interested-button" onClick={(e) => onNotInterestedClick(e.currentTarget, entry)}>
                <img src={NotInterestedIcon} />
            </button>
        );
    });
};

function initVisibleChangedListener(): void {
    BrowserStorage.setEntriesVisibleCallback((newVisibleValue: boolean) => {
        if (!ElementFinder.isTopTablePage())
            return;
    
        isVisibleCache = newVisibleValue;
        ElementFinder.forTopTableEntryStatusButtons(async (_statusButton, isNotWatched, _buttonParent, entry) => {
            if (!isNotWatched)
                entry.style.display = newVisibleValue ? "" : "none";
        });
    });
}

function init(): void {
    const observer = new MutationObserver(() => {
        initTopTable();
    });
    observer.observe(document, { subtree: true, attributes: true });

    initVisibleChangedListener();
}

let isVisibleCache: boolean = null;
let ignoredNamesCache: Set<string> = null;

async function loadStorageEntries(): Promise<void> {
    isVisibleCache = await BrowserStorage.getEntriesVisible();
    ignoredNamesCache = await BrowserStorage.getIgnoredNames();
}

let isInitialized = false;

// BrowserStorage.clearIgnoredNames().then(() => {
//     BrowserStorage.getIgnoredNames().then((x) => {
//         console.log("Cleaned names:", x);
//     });
// });

loadStorageEntries().then(() => {
    init();
});

