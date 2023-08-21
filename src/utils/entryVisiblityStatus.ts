
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
    HideNotInterestedOnly = "hide-not-interested",
    /**
     * Leaves only entries in list (watching, completed, etc) by hiding all not interested
     * and not in list entries.
     */
    InListOnly = "in-list-only",
}

/**
 * Gets element visibility based on entry visibility status definition and relevant parameters.
 * @param entryVisibilityStatus Entry visiblity status based on which visibility is decided.
 * @param isStatusInList Whether entry is in list (watching, completed, etc).
 * @param isNotInterested Whether entry is marked as not interested.
 * @returns True if entry should be visible based on the passed parameters, false otherwise.
 */
export function getElementVisibility(entryVisibilityStatus: EntryVisibilityStatus, isStatusInList: boolean, isNotInterested: boolean): boolean {
    switch (entryVisibilityStatus) {
        case EntryVisibilityStatus.Default:
            return true;
        case EntryVisibilityStatus.NotInListOnly:
            return !isStatusInList && !isNotInterested;
        case EntryVisibilityStatus.HideNotInterestedOnly:
            return !isNotInterested;
        case EntryVisibilityStatus.InListOnly:
            return isStatusInList && !isNotInterested;
    }
}