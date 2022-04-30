export type EntryStatusButtonCallback = (statusButton: HTMLElement, isNotWatched: boolean, buttonParent: HTMLElement, entry: HTMLElement) => void;

export class ElementFinder {
    private static topTableQuery = "table.top-ranking-table";
    private static allEntriesQuery = "tr.ranking-list";
    private static watchStatusButtonQuery = "a.js-anime-watch-status";
    private static titleHeaderQuery = "h3.anime_ranking_h3 > a";

    private static notWatchedStatusClass = "notinmylist";
    public static notInterestedStatusClass = "not-interested-override";

    public static isTopTablePage(): boolean {
        return this.findTopTable() != null;
    }

    public static async forTopTableEntryStatusButtons(callback: EntryStatusButtonCallback): Promise<void> {
        const entries = this.findTopTableEntries();
        entries?.forEach(async (entry: HTMLElement) => {
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

}