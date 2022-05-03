export type EntryStatusButtonCallback = (statusButton: HTMLElement, isNotWatched: boolean, buttonParent: HTMLElement, entry: HTMLElement) => void;
export type EntryNameCallback = (name: string, entry: HTMLElement) => void;

export class ElementFinder {
    private static topTableQuery = "table.top-ranking-table";
    private static searchTableQuery = "div.seasonal-anime-list";

    private static allTopTableEntriesQuery = "tr.ranking-list";
    private static allSearchTableEntriesQuery = "div.js-anime-category-producer.seasonal-anime";

    private static watchStatusButtonQuery = "a.js-anime-watch-status";
    private static topTableTitleHeaderQuery = "h3.anime_ranking_h3 > a";
    private static searchTableTitleHeaderQuery = "h2.h2_anime_title > a";
    
    private static notInterestedButtonQuery = ".not-interested-button";

    private static notWatchedStatusClass = "notinmylist";
    public static notInterestedStatusClass = "not-interested-override";

    public static isSupportedPage(): boolean {
        return this.findTopTable() != null || this.findSearchTables().length > 0;
    }

    private static findTopTable(): HTMLElement | null {
        return document.querySelector(this.topTableQuery);
    }

    public static findSearchTables(): NodeListOf<HTMLElement> | null {
        return document.querySelectorAll<HTMLElement>(this.searchTableQuery);
    }

    public static forEachEntryStatusButtons(callback: EntryStatusButtonCallback): void {
        const entries = this.findTopTableEntries() ?? this.findSearchTableEntries();
        entries?.forEach((entry: HTMLElement) => {
            const statusButton = this.findWatchStatusButton(entry);
            const isNotWatched = this.isButtonNotWatched(statusButton);
            const parent = statusButton.parentNode as HTMLElement;
            callback(statusButton, isNotWatched, parent, entry);
        });
    }

    private static findTopTableEntries(): NodeListOf<HTMLElement> | null {
        const table = this.findTopTable();
        return table?.querySelectorAll<HTMLElement>(this.allTopTableEntriesQuery);
    }

    public static findSearchTableEntries(): HTMLElement[] | null {
        const tables = this.findSearchTables();
        const searchEntries: HTMLElement[] = [];
        tables?.forEach(table => 
            table.querySelectorAll<HTMLElement>(this.allSearchTableEntriesQuery)
                .forEach(entry => searchEntries.push(entry))
        );

        return searchEntries;
    }

    public static findEntryName(entry: HTMLElement): string {
        return this.findTopTableEntryName(entry) ?? this.findSearchTableEntryName(entry);
    }

    public static findTopTableEntryName(entry: HTMLElement): string | null {
        return entry.querySelector(this.topTableTitleHeaderQuery)?.textContent;
    }

    public static findSearchTableEntryName(entry: HTMLElement): string | null {
        return entry.querySelector(this.searchTableTitleHeaderQuery)?.textContent;
    }

    public static findWatchStatusButton(entry: HTMLElement): HTMLElement | null {
        return entry.querySelector(this.watchStatusButtonQuery);
    }

    public static findNotInterestedButton(statusButtonParent: HTMLElement): HTMLElement | null {
        return statusButtonParent.querySelector(this.notInterestedButtonQuery);
    }

    private static isButtonNotWatched(watchStatusButton: Element): boolean {
        return watchStatusButton.classList.contains(this.notWatchedStatusClass)
            && !watchStatusButton.classList.contains(this.notInterestedStatusClass);
    }
}