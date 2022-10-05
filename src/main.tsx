import { ElementFinder } from "./utils/elementFinder";
import { BrowserStorage } from "./utils/storage";
import NotInterestedIcon from "./images/not-interested.svg";

/** Text to set for "Not interested" button. */
const notInterestedButtonText: string = "Not interested";
/** Class name to set for "Not interested" button. */
const notInterestedButtonClassName: string = "not-interested-button";

/**
 * Helper function to set HTML element visibility.
 * @param element HTML element to set visibility.
 * @param isVisible Whether element should be visible.
 */
function setElementVisibleStatus(element: HTMLElement, isVisible: boolean): void {
    element.style.display = isVisible ? "" : "none";
}

/**
 * Helper function to instantly hide entry if currently entries are set to not be visible.
 * @param entry Entry to optionally hide.
 */
function hideEntryIfNotVisible(entry: HTMLElement): void {
    if (!isEntriesVisibleCache)
        setElementVisibleStatus(entry, false);
}

/**
 * Watch status button text before it was transformed into "Not interested" button.
 * It needs to be saved, since there is no other way to restore it into the previous state.
 */
 let oldWatchStatusButtonText: string;

/**
 * Transforms watch status button into "Not interested" button.
 * @param watchStatusButton Watch status button to transform.
 */
function transformNotInterestedStatusButton(watchStatusButton: HTMLElement): void {
    watchStatusButton.classList.add(ElementFinder.notInterestedStatusClass);
    if (!oldWatchStatusButtonText)
        oldWatchStatusButtonText = watchStatusButton.textContent;

    watchStatusButton.textContent = notInterestedButtonText;
}

/**
 * Undo "Not interesting" status from given watch status button,
 * that was set using {@link transformNotInterestedStatusButton} function.
 * @param watchStatusButton Watch status button to restore to original.
 */
function undoNotInterestedStatusButton(watchStatusButton: HTMLElement): void {
    watchStatusButton.classList.remove(ElementFinder.notInterestedStatusClass);
    if (!oldWatchStatusButtonText)
        console.error("oldWatchStatusButtonText was never set");

    watchStatusButton.textContent = oldWatchStatusButtonText;
}

/**
 * Adds new entry to not interested, transforms watch status into "Not interested"
 * and hides caller button.
 * @param notInterestedButton "Not interested" button that was clicked.
 * @param entry Parent entry to add to not interested.
 */
function onNotInterestedClick(notInterestedButton: HTMLButtonElement, entry: HTMLElement): void {
    const parent = notInterestedButton.parentNode as HTMLElement;
    const watchStatusButton = ElementFinder.findWatchStatusButton(parent);
    const entryName = ElementFinder.findEntryName(entry);

    transformNotInterestedStatusButton(watchStatusButton);
    setElementVisibleStatus(notInterestedButton, false);
    hideEntryIfNotVisible(entry);

    ignoredNamesCache.add(entryName);
    BrowserStorage.addIgnoredName(entryName);
}

/**
 * Creates "Not interested" HTML button.
 * @param entry Entry to bind for on click action.
 * @param isVisible Whether it should be instantly visible or hidden.
 * @returns Created button.
 */
function createNotInterestedButton(entry: HTMLElement, isVisible: boolean): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add(notInterestedButtonClassName);
    button.onclick = () => onNotInterestedClick(button, entry);

    const buttonImage = document.createElement("img");
    buttonImage.src = NotInterestedIcon;

    button.appendChild(buttonImage);
    setElementVisibleStatus(button, isVisible);

    return button;
}

/**
 * Initializes page by looping and modifying entries depending on pre-loaded options.
 */
function initPage(): void {
    if (!ElementFinder.isSupportedPage())
        return;

    ElementFinder.forEachEntryStatusButtons((statusButton, isNotWatched, buttonParent, entry) => {
        if (!isNotWatched) {
            hideEntryIfNotVisible(entry);
            return;
        }

        let isVisible = true;
        const name = ElementFinder.findEntryName(entry);
        if (ignoredNamesCache.has(name)) {
            transformNotInterestedStatusButton(statusButton);
            hideEntryIfNotVisible(entry);
            isVisible = false;
        }

        if (!isInitialized) {
            const newButton = createNotInterestedButton(entry, isVisible);
            buttonParent.appendChild(newButton);            
        }
    });

    ElementFinder.findSeasonalAds()?.forEach(ad => setElementVisibleStatus(ad, false));

    isInitialized = true;
};

/**
 * Adds listener for entries visible value to live refresh entry visibility.
 */
function initVisibleChangedListener(): void {
    BrowserStorage.setEntriesVisibleCallback((newIsVisibleValue: boolean) => {
        console.log("gogo");
        if (!ElementFinder.isSupportedPage())
            return;
    
        isEntriesVisibleCache = newIsVisibleValue;
        ElementFinder.forEachEntryStatusButtons((_statusButton, isNotWatched, _buttonParent, entry) => {
            if (!isNotWatched)
                setElementVisibleStatus(entry, newIsVisibleValue);
        });

        ElementFinder.findSeasonalAds()?.forEach(ad => setElementVisibleStatus(ad, false));
    });
}

/**
 * Adds listener for ignored names removal to live refresh removed ignored entry.
 */
function initIgnoredNamesRemovedListener(): void {
    BrowserStorage.setIgnoredNamesRemovedCallback((removedName: string) => {
        if (!ElementFinder.isSupportedPage())
            return;

        ignoredNamesCache.delete(removedName);
        ElementFinder.forEachEntryStatusButtons((statusButton, isNotWatched, buttonParent, entry) => {
            const name = ElementFinder.findEntryName(entry);
            if (name !== removedName)
                return;

            const notInterestedButton = ElementFinder.findNotInterestedButton(buttonParent);
            undoNotInterestedStatusButton(statusButton);
            setElementVisibleStatus(entry, true);
            setElementVisibleStatus(notInterestedButton, true);
        });
    });
}

/** Cache for entries visible value. */
let isEntriesVisibleCache: boolean;
/** Cache for ignored names list. */
let ignoredNamesCache: Set<string>;
/** Whether page has been initialized, will reset when new page loads. */
let isInitialized = false;

/**
 * Initializes document change observer to call initialization once it's loaded
 * and adds browser local storage change listeners.
 */
function init(): void {
    const observer = new MutationObserver(initPage);
    observer.observe(document, { subtree: true, attributes: true });

    initVisibleChangedListener();
    initIgnoredNamesRemovedListener();
}

/**
 * Loads initial options from browser local storage.
 */
async function loadStorageEntries(): Promise<void> {
    isEntriesVisibleCache = await BrowserStorage.getEntriesVisible();
    ignoredNamesCache = await BrowserStorage.getIgnoredNames();
}

// Need to load saved initial options before initializing.
loadStorageEntries().then(init);

