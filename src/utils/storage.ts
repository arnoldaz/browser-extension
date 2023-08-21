import { EntryVisibilityStatus } from "./entryVisiblityStatus";

/** Helper class for managing data in browser local storage. */
export class BrowserStorage {
    private static readonly entryVisiblityKey = "entry-visibility-status";
    private static readonly ignoredNamesKey = "ignored-names";

    /**
     * Sets entry visiblity value in local storage.
     * @param value Value to set.
     */
    public static async setEntryVisibility(value: EntryVisibilityStatus): Promise<void> {
        await browser.storage.local.set({ [this.entryVisiblityKey]: value });
    }

    /**
     * Adds listener for entries visible value change in local storage.
     * @param callback Callback to call when entries visible value has changed.
     */
    public static setEntryVisibilityCallback(callback: (newVisibleValue: EntryVisibilityStatus) => void): void {
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName != "local")
                return;

            const value = changes[this.entryVisiblityKey];
            if (!value)
                return;

            callback(value.newValue);
        });
    }

    /**
     * Gets entries visible value from local storage.
     * @returns Saved entries visible value. Defaults to true if never set.
     */
    public static async getEntryVisibility(): Promise<EntryVisibilityStatus> {
        return new Promise<EntryVisibilityStatus>((resolve) => {
            browser.storage.local.get(this.entryVisiblityKey).then(dictionary => {
                const entryVisiblityStatus = dictionary[this.entryVisiblityKey] as EntryVisibilityStatus | undefined;
                resolve(entryVisiblityStatus ?? EntryVisibilityStatus.Default);
            });
        });
    }

    /**
     * Adds listener for removing ignored name from local storage.
     * @param callback Callback to call when ignored name has been removed.
     */
    public static setIgnoredNamesRemovedCallback(callback: (removedName: string) => void): void {
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName != "local")
                return;

            const value = changes[this.ignoredNamesKey];
            if (!value)
                return;

            const oldValues = value.oldValue as Set<string>;
            const newValues = value.newValue as Set<string>;
            if (oldValues.size <= newValues.size)
                return;

            const removedValues = [...oldValues].filter(oldValue => !newValues.has(oldValue));
            removedValues.forEach(removedValue => callback(removedValue));
        });
    }

    /**
     * Gets all ignored names from local storage.
     * @returns All saved ignored names.
     */
    public static async getIgnoredNames(): Promise<Set<string>> {
        return new Promise<Set<string>>(resolve => {
            browser.storage.local.get(this.ignoredNamesKey).then((dictionary) => {
                const currentNameList = dictionary[this.ignoredNamesKey] as Set<string> | undefined;
                resolve(currentNameList ?? new Set());
            });
        });
    }

    /**
     * Adds ignored name to local storage.
     * @param name Ignored name to add.
     */
    public static async addIgnoredName(name: string): Promise<void> {
        return new Promise<void>(resolve => {
            browser.storage.local.get(this.ignoredNamesKey).then((dictionary) => {
                const currentNameList = dictionary[this.ignoredNamesKey] as Set<string> | undefined;
                if (currentNameList === undefined)
                    browser.storage.local.set({ [this.ignoredNamesKey]: new Set([name]) }).then(resolve);
                else {
                    if (currentNameList.has(name))
                        resolve();
        
                    currentNameList.add(name);
                    browser.storage.local.set({ [this.ignoredNamesKey]: currentNameList }).then(resolve);
                }
            });
        });
    }

    /**
     * Removes ignored name from local storage.
     * @param name Ignored name to remove.
     */
    public static async removeIgnoredName(name: string): Promise<void> {
        return new Promise<void>((resolve) => {
            browser.storage.local.get(this.ignoredNamesKey).then((dictionary) => {
                const currentNameList = dictionary[this.ignoredNamesKey] as Set<string> | undefined;
                if (currentNameList === undefined)
                    resolve();

                if (!currentNameList.has(name))
                    resolve();

                currentNameList.delete(name);
                browser.storage.local.set({ [this.ignoredNamesKey]: currentNameList }).then(resolve);
            });
        });
    }

    /**
     * Removes all ignored names from local storage.
     */
    public static async clearIgnoredNames(): Promise<void> {
        await browser.storage.local.remove(this.ignoredNamesKey);
    }

    /**
     * Checks whether given name exists in ignored name storage.
     * @param nameToCheck Name to check whether it's in storage.
     * @returns True if name is in storage, false otherwise.
     */
    public static async checkIgnoredName(nameToCheck: string): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            browser.storage.local.get(this.ignoredNamesKey).then((dictionary) => {
                const currentNameList = dictionary[this.ignoredNamesKey] as Set<string> | undefined;
                resolve(currentNameList.has(nameToCheck));
            });
        });
    }
}
