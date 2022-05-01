export class BrowserStorage {
    private static ignoredNamesKey = "ignored-names";
    private static entriesVisibleKey = "entries-visible";

    public static async setEntriesVisible(value: boolean): Promise<void> {
        await browser.storage.local.set({ [this.entriesVisibleKey]: value });
    }

    public static setEntriesVisibleCallback(callback: (newVisibleValue: boolean) => void): void {
        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName != "local")
                return;

            const value = changes[this.entriesVisibleKey];
            if (!value)
                return;

            callback(value.newValue);
        });
    }

    public static async getEntriesVisible(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            browser.storage.local.get(this.entriesVisibleKey).then((dictionary) => {
                const isVisible = dictionary[this.entriesVisibleKey] as boolean | undefined;
                if (isVisible === undefined)
                    resolve(true);

                resolve(isVisible);
            });
        });
    }

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

    public static async getIgnoredNames(): Promise<Set<string>> {
        return new Promise<Set<string>>((resolve) => {
            browser.storage.local.get(this.ignoredNamesKey).then((dictionary) => {
                const currentNameList = dictionary[this.ignoredNamesKey] as Set<string> | undefined;
                if (currentNameList === undefined)
                    resolve(new Set());

                resolve(currentNameList);
            });
        });
    }

    public static async addIgnoredName(name: string): Promise<void> {
        return new Promise<void>((resolve) => {
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

    public static async clearIgnoredNames(): Promise<void> {
        await browser.storage.local.remove(this.ignoredNamesKey);
    }
}
