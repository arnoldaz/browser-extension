import { BrowserStorage } from "./utils/storage";
import { Entry, getPageWrapper, PageWrapper } from "./utils/pageWrappers";
import { ButtonTransformer, setElementVisibleStatus } from "./utils/buttonTransformer";
import { EntryVisibilityStatus, getElementVisibility } from "./utils/entryVisiblityStatus";

/**
 * Helper function to instantly hide entry if its set to be not visible based on cached parameters.
 * @param entry Entry to conditionally hide.
 * @param entryName Entry name to check for ignored names cache.
 * @param inStatusInList Whether entry status is in list.
 */
function hideEntryIfNotVisible(entry: Entry, entryName: string, isStatusInList: boolean): void {
    if (!getElementVisibility(entryVisibilityCache, isStatusInList, ignoredNamesCache.has(entryName)))
        setElementVisibleStatus(entry, false);
}

/** Initializes page by looping and modifying entries depending on pre-loaded options. */
function initPage(): void {
    if (!ensurePageWrapperInitialized())
        return;

    pageWrapper.forEachEntry((entry, entryName, statusButton, isStatusInList, statusButtonParent) => {
        // If entry is in list, no need to add any additional functionality, just edit visibility if needed
        if (isStatusInList) {
            hideEntryIfNotVisible(entry, entryName, isStatusInList);
            return;
        }

        // If entry is already in ignored names list, transform the status button and edit entry visibility
        let isVisible = true;
        if (ignoredNamesCache.has(pageWrapper.getEntryName(entry))) {
            buttonTransformer.transformNotInterestedStatusButton(statusButton);
            hideEntryIfNotVisible(entry, entryName, isStatusInList);
            isVisible = false;
        }

        // If entry is not in list, attach new button besides it, but only once
        if (!isInitialized) {
            const newButton = buttonTransformer.createNotInterestedButton(entry, isVisible, entry => {
                const entryName = this.pageWrapper.getEntryName(entry);
                hideEntryIfNotVisible(entry, entryName, isStatusInList);

                ignoredNamesCache.add(entryName);
                BrowserStorage.addIgnoredName(entryName);
            });

            statusButtonParent.appendChild(newButton);
        }
    });

    pageWrapper.getRemovableElements().forEach(element => setElementVisibleStatus(element, false));
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
    BrowserStorage.setEntryVisibilityCallback(newEntryVisibilityValue => {
        if (!ensurePageWrapperInitialized())
            return;
    
        entryVisibilityCache = newEntryVisibilityValue;

        pageWrapper.forEachEntry((entry, entryName, _statusButton, isStatusInList, _buttonParent) => {
            const visible = getElementVisibility(newEntryVisibilityValue, isStatusInList, ignoredNamesCache.has(entryName));
            setElementVisibleStatus(entry, visible);
        });

        pageWrapper.getRemovableElements().forEach(element => setElementVisibleStatus(element, false));
    });
}

/** Adds listener for ignored names removal to live refresh removed ignored entry. */
function initIgnoredNamesRemovedListener(): void {
    BrowserStorage.setIgnoredNamesRemovedCallback((removedName: string) => {
        if (!ensurePageWrapperInitialized())
            return;

        ignoredNamesCache.delete(removedName);
        pageWrapper.forEachEntry((entry, entryName, statusButton, _isStatusInList, buttonParent) => {
            if (entryName !== removedName)
                return;

            const notInterestedButton = buttonTransformer.getNotInterestedButton(buttonParent);
            buttonTransformer.undoNotInterestedStatusButton(statusButton);
            setElementVisibleStatus(entry, true);
            setElementVisibleStatus(notInterestedButton, true);
        });
    });
}

/** Cache for entries visible value. */
let entryVisibilityCache: EntryVisibilityStatus;
/** Cache for ignored names list. */
let ignoredNamesCache: Set<string>;
/** Whether page has been initialized, will reset when new page loads. */
let isInitialized = false;
/** Page wrapper for supported pages. */
let pageWrapper: PageWrapper | null;
/** Button transformer for modifying entry status and buttons. */
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
    entryVisibilityCache = await BrowserStorage.getEntryVisibility();
    ignoredNamesCache = await BrowserStorage.getIgnoredNames();
}

// Need to load saved initial options before initializing.
loadStorageEntries().then(init);
