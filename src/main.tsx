import { ElementFinder } from "./utils/elementFinder";
import { BrowserStorage } from "./utils/storage";
import { Entry, getPageWrapper, PageWrapper } from "./utils/pageWrappers";
import { ButtonTransformer, setElementVisibleStatus } from "./utils/buttonTransformer";


/** Status for entry visibility when list page is open. */
export enum EntryVisibilityStatus {
    /**
     * Default status where everything is visible.
     */
    Default = "default",
    /**
     * Hides entries in list (watching, completed, etc) and not interested,
     * leaving only entries not in any list.
     */
    NotInListOnly = "not-in-list-only",
    /**
     * Hides only not interested entries, leaving all the other entries.
     */
    HideNotInteresteOnly = "hide-not-interested",
    /**
     * Leaves only entries in list (watching, completed, etc) by hiding all not interested
     * and not in list entries.
     */
    InListOnly = "in-list-only",
}

/**
 * Helper function to instantly hide entry if currently entries are set to not be visible.
 * @param entry Entry to conditionally hide.
 */
function hideEntryIfNotVisible(entry: Entry): void {
    if (!isEntriesVisibleCache)
        setElementVisibleStatus(entry, false);
}

/** Initializes page by looping and modifying entries depending on pre-loaded options. */
function initPage(): void {
    if (!ensurePageWrapperInitialized())
        return;

    pageWrapper.forEachEntry((entry, statusButton, isStatusInList, buttonParent) => {
        // If entry is in list, no need to add any additional functionality, just edit visibility if needed
        if (isStatusInList) {
            hideEntryIfNotVisible(entry);
            return;
        }

        // If entry is already in ignored names list, transform the status button and edit entry visibility
        let isVisible = true;
        if (ignoredNamesCache.has(pageWrapper.getEntryName(entry))) {
            buttonTransformer.transformNotInterestedStatusButton(statusButton);
            hideEntryIfNotVisible(entry);
            isVisible = false;
        }

        // If entry is not in list, attach new button besides it, but only once
        if (!isInitialized) {
            const newButton = buttonTransformer.createNotInterestedButton(entry, isVisible, (entry) => {
                hideEntryIfNotVisible(entry);
                
                const entryName = this.pageWrapper.getEntryName(entry);
                ignoredNamesCache.add(entryName);
                BrowserStorage.addIgnoredName(entryName);
            });
            buttonParent.appendChild(newButton);
        }
    });

    ElementFinder.findSeasonalAds()?.forEach(ad => setElementVisibleStatus(ad, false));

    isInitialized = true;
};

function ensurePageWrapperInitialized(): boolean {
    if (pageWrapper)
        return true;

    pageWrapper = getPageWrapper();
    if (!pageWrapper)
        return false;

    buttonTransformer = new ButtonTransformer(pageWrapper);
    return true;
}

/** Adds listener for entries visible value to live refresh entry visibility. */
function initVisibleChangedListener(): void {
    BrowserStorage.setEntriesVisibleCallback((newIsEntriesVisibleValue: boolean) => {
        if (!ensurePageWrapperInitialized())
            return;
    
        isEntriesVisibleCache = newIsEntriesVisibleValue;
        pageWrapper.forEachEntry((entry, _statusButton, isStatusInList, _buttonParent) => {
            if (isStatusInList)
                setElementVisibleStatus(entry, newIsEntriesVisibleValue);
        });

        ElementFinder.findSeasonalAds()?.forEach(ad => setElementVisibleStatus(ad, false));
    });
}

/** Adds listener for ignored names removal to live refresh removed ignored entry. */
function initIgnoredNamesRemovedListener(): void {
    BrowserStorage.setIgnoredNamesRemovedCallback((removedName: string) => {
        if (!ensurePageWrapperInitialized())
            return;

        ignoredNamesCache.delete(removedName);
        pageWrapper.forEachEntry((entry, statusButton, _isStatusInList, buttonParent) => {
            if (pageWrapper.getEntryName(entry) !== removedName)
                return;

            const notInterestedButton = buttonTransformer.getNotInterestedButton(buttonParent);
            buttonTransformer.undoNotInterestedStatusButton(statusButton);
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
/** Page wrapper for supported pages. */
let pageWrapper: PageWrapper | null;

let buttonTransformer: ButtonTransformer;

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

/** Loads initial options from browser local storage. */
async function loadStorageEntries(): Promise<void> {
    isEntriesVisibleCache = await BrowserStorage.getEntriesVisible();
    ignoredNamesCache = await BrowserStorage.getIgnoredNames();
}

// Need to load saved initial options before initializing.
loadStorageEntries().then(init);

