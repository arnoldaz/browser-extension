export type EntryStatusButtonCallback = (statusButton: HTMLElement, isNotWatched: boolean, buttonParent: HTMLElement, entry: HTMLElement) => void;
export type EntryNameCallback = (name: string, entry: HTMLElement) => void;

export class ElementFinder {
    private static topTableQuery = "table.top-ranking-table";
    private static allEntriesQuery = "tr.ranking-list";
    private static watchStatusButtonQuery = "a.js-anime-watch-status";
    private static titleHeaderQuery = "h3.anime_ranking_h3 > a";
    private static notInterestedButtonQuery = ".not-interested-button";

    private static notWatchedStatusClass = "notinmylist";
    public static notInterestedStatusClass = "not-interested-override";

    public static isTopTablePage(): boolean {
        return this.findTopTable() != null;
    }

    public static forTopTableEntryStatusButtons(callback: EntryStatusButtonCallback): void {
        const entries = this.findTopTableEntries();
        entries?.forEach((entry: HTMLElement) => {
            const statusButton = this.findWatchStatusButton(entry);
            const isNotWatched = this.isButtonNotWatched(statusButton);
            const parent = statusButton.parentNode as HTMLElement;
            callback(statusButton, isNotWatched, parent, entry);
        });
    }

    public static findWatchStatusButton(entry: HTMLElement): HTMLElement | null {
        return entry.querySelector(this.watchStatusButtonQuery);
    }

    public static findEntryName(entry: HTMLElement): string {
        return entry.querySelector(this.titleHeaderQuery).textContent;
    }

    public static findNotInterestedButton(statusButtonParent: HTMLElement): HTMLElement | null {
        return statusButtonParent.querySelector(this.notInterestedButtonQuery);
    }

    private static findTopTable(): HTMLElement | null {
        return document.querySelector(this.topTableQuery);
    }

    private static findTopTableEntries(): NodeListOf<HTMLElement> | null {
        const table = this.findTopTable();
        return table?.querySelectorAll<HTMLElement>(this.allEntriesQuery);
    }

    private static isButtonNotWatched(watchStatusButton: Element): boolean {
        return watchStatusButton.classList.contains(this.notWatchedStatusClass)
            && !watchStatusButton.classList.contains(this.notInterestedStatusClass);
    }

    private static searchTableQuery = "div.seasonal-anime-list.js-seasonal-anime-list";
    private static allSearchEntriesQuery = "div.js-anime-category-producer.seasonal-anime";
    private static titleHeaderSearchQuery = "h2.h2_anime_title > a";

    public static isSearchTablePage(): boolean {
        return this.findSearchTables() != null;
    }

    public static findSearchTables(): NodeListOf<HTMLElement> | null {
        return document.querySelectorAll<HTMLElement>(this.searchTableQuery);
    }

    public static findSearchEntries(): HTMLElement[] | null {
        const tables = this.findSearchTables();
        const searchEntries: HTMLElement[] = [];
        tables?.forEach(table => 
            table.querySelectorAll<HTMLElement>(this.allSearchEntriesQuery)
                .forEach(entry => searchEntries.push(entry))
        );

        return searchEntries;
    }

    public static forSearchTableEntryStatusButtons(callback: EntryStatusButtonCallback): void {
        const entries = this.findSearchEntries();
        entries?.forEach((entry: HTMLElement) => {
            const statusButton = this.findWatchStatusButton(entry);
            const isNotWatched = this.isButtonNotWatched(statusButton);
            const parent = statusButton.parentNode as HTMLElement;
            callback(statusButton, isNotWatched, parent, entry);
        });
    }
}