import React from "dom-chef";
import { ElementFinder } from "./utils/elementFinder";
import { BrowserStorage } from "./utils/storage";
import NotInterestedIcon from "./images/not-interested.svg";

function hideEntryIfNotVisible(entry: HTMLElement): void {
    if (!isVisibleCache)
        entry.style.display = "none";
}

let oldWatchStatusButtonText: string;
function makeNotInterestedStatusButton(watchStatusButton: HTMLElement): void {
    watchStatusButton.classList.add(ElementFinder.notInterestedStatusClass);
    if (!oldWatchStatusButtonText)
        oldWatchStatusButtonText = watchStatusButton.textContent;
    watchStatusButton.textContent = "Not interested";
}

function undoNotInterestedStatusButton(watchStatusButton: HTMLElement): void {
    watchStatusButton.classList.remove(ElementFinder.notInterestedStatusClass);
    watchStatusButton.textContent = oldWatchStatusButtonText;
}

function onNotInterestedClick(target: EventTarget, entry: HTMLElement): void {
    const notInterestedButton = target as HTMLButtonElement;
    const parent = notInterestedButton.parentNode as HTMLElement;
    const watchStatusButton = ElementFinder.findWatchStatusButton(parent);
    const name = ElementFinder.findEntryName(entry);

    makeNotInterestedStatusButton(watchStatusButton);
    notInterestedButton.style.display = "none";
    hideEntryIfNotVisible(entry);

    ignoredNamesCache.add(name);
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

        let isHidden = false;
        const name = ElementFinder.findEntryName(entry);
        if (ignoredNamesCache.has(name)) {
            makeNotInterestedStatusButton(statusButton);
            hideEntryIfNotVisible(entry);
            isHidden = true;
        }

        buttonParent.appendChild(
            <button 
                className="not-interested-button"
                onClick={e => onNotInterestedClick(e.currentTarget, entry)} 
                style={{display: isHidden ? "none" : ""}}>
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
        ElementFinder.forTopTableEntryStatusButtons((_statusButton, isNotWatched, _buttonParent, entry) => {
            if (!isNotWatched)
                entry.style.display = newVisibleValue ? "" : "none";
        });
    });
}

function initIgnoredNamesRemovedListener(): void {
    BrowserStorage.setIgnoredNamesRemovedCallback((removedName: string) => {
        if (!ElementFinder.isTopTablePage())
            return;

        ignoredNamesCache.delete(removedName);
        ElementFinder.forTopTableEntryStatusButtons((statusButton, isNotWatched, buttonParent, entry) => {
            const name = ElementFinder.findEntryName(entry);
            if (name != removedName)
                return;

            const notInterestedButton = ElementFinder.findNotInterestedButton(buttonParent);
            undoNotInterestedStatusButton(statusButton);
            entry.style.display = "";
            notInterestedButton.style.display = "";
        });
    });
}

function init(): void {
    const observer = new MutationObserver(() => {
        initTopTable();
    });
    observer.observe(document, { subtree: true, attributes: true });

    initVisibleChangedListener();
    initIgnoredNamesRemovedListener();
}

let isVisibleCache: boolean = null;
let ignoredNamesCache: Set<string> = null;

async function loadStorageEntries(): Promise<void> {
    isVisibleCache = await BrowserStorage.getEntriesVisible();
    ignoredNamesCache = await BrowserStorage.getIgnoredNames();
}

let isInitialized = false;

loadStorageEntries().then(() => {
    init();
});

