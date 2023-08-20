
export type EntryStatusButtonCallback = 
    (statusButton: StatusButton, isNotWatched: boolean, buttonParent: StatusButtonParent, entry: Entry) => void;



export type EntryNameCallback = (name: string, entry: Entry) => void;

/** Main table HTML element type. */
export type MainTable = HTMLElement;
/** Single entry HTML element type. */
export type Entry = HTMLElement;
/** Status button HTML element type. */
export type StatusButton = HTMLElement;
/** Parent of status button HTML element type. */
export type StatusButtonParent = HTMLElement;


export type NotInterestedButton = HTMLElement;

export function getPageWrapper(): PageWrapper | null {
    const topTablePageWrapper = new TopTablePageWrapper();
    if (topTablePageWrapper.tryLoadPage())
        return topTablePageWrapper;

    const searchTablePageWrapper = new SearchTablePageWrapper();
    if (searchTablePageWrapper.tryLoadPage())
        return searchTablePageWrapper;

    const singleEntryPageWrapper = new SingleEntryPageWrapper();
    if (singleEntryPageWrapper.tryLoadPage())
        return singleEntryPageWrapper;

    return null;
}

export abstract class PageWrapper {
    protected mainTable: MainTable;
    protected entries: Entry[];

    protected abstract readonly mainTableQuery: string;
    protected abstract readonly entriesQuery: string;
    protected abstract readonly statusButtonQuery: string;
    protected abstract readonly entryNameQuery: string;
    protected abstract readonly notWatchedStatusClass: string;

    public readonly notInterestedStatusClass = "not-interested-override"; // ???

    public tryLoadPage(): boolean {
        const mainTable = this.getMainTable();
        if (!mainTable)
            return false;

        this.mainTable = mainTable;
        this.entries = this.getEntries(mainTable);
        return true;
    }

    public forEachEntryStatusButtons(callback: EntryStatusButtonCallback): void {
        this.entries.forEach((entry: Entry) => {
            const statusButton = this.getStatusButton(entry);
            const isNotWatched = !this.isStatusWatched(statusButton);
            const parent = statusButton.parentNode as StatusButtonParent;
            callback(statusButton, isNotWatched, parent, entry);
        });
    }

    protected getMainTable(): MainTable | null {
        return document.querySelector<MainTable>(this.mainTableQuery);
    }

    protected getEntries(mainTable: MainTable): Entry[] {
        return Array.from(mainTable.querySelectorAll<Entry>(this.entriesQuery));
    }

    protected getStatusButton(entry: Entry): StatusButton {
        return entry.querySelector<StatusButton>(this.statusButtonQuery);
    }

    public getEntryName(entry: Entry): string {
        return entry.querySelector(this.entryNameQuery).textContent;
    }

    protected isStatusWatched(watchStatusButton: StatusButton): boolean {
        return watchStatusButton.classList.contains(this.notInterestedStatusClass)
            || !watchStatusButton.classList.contains(this.notWatchedStatusClass)
    }

}

/**
 * Page wrapper for top table pages (by score, popularity, etc).
 * 
 * ```
 * // Page structure:
 * <table class="top-ranking-table"> // Main table for all the entries
 *   <tr class="ranking-list"> // Single entry
 *     ...
 *     <td class="title ..."> // Entry title block
 *       <div> // Several div layers
 *         <h3 class="... anime_ranking_h3">
 *           <a>ENTRY_NAME</a> // Entry title text
 *         </h3>
 *       </div>
 *     </td>
 *     <td class="status ..."> // Entry status block
 *       // Entry status button (Completed, Add to list, etc)
 *       // Contains one of the classes depending on button status:
 *       // * Add to list - "notinmylist"
 *       // * Completed - "completed"
 *       // * Dropped - "dropped"
 *       // * Plan to Watch - "plantowatch"
 *       // * On-Hold - "on-hold"
 *       <a class="js-anime-watch-status ...">STATUS_TEXT</a>
 *     </td>
 *   </tr>
 *   <tr class="ranking-list">...</tr>
 *   <tr class="ranking-list">...</tr>
 *   ...
 * </table>
 * ```
 */
export class TopTablePageWrapper extends PageWrapper {
    protected override readonly mainTableQuery = "table.top-ranking-table";
    protected override readonly entriesQuery = "tr.ranking-list";
    protected override readonly statusButtonQuery = "a.js-anime-watch-status";
    protected override readonly entryNameQuery = "h3.anime_ranking_h3 > a";
    protected override readonly notWatchedStatusClass = "notinmylist";
}

/**
 * Page wrapper for seasonal or search result pages.
 * 
 * ```
 * // Page structure:
 * <div class="js-categories-seasonal"> // Main table for all the entries
 *   <div> // Several div layers
 *     <div class="js-anime-category-producer seasonal-anime ..."> // Single entry
 *       <div> // Title div
 *         <div> // Several div layers
 *           <h2 class="h2_anime_title"> // Entry title block
 *             <a>ENTRY_NAME</a> // Entry title text
 *           </h2>
 *         </div>
 *       </div>
 *       ...
 *       <div> // Status div
 *         <div> // Several div layers
 *           <a class="js-anime-watch-status ..."> // Entry status button
 *             <span>Watching</span>
 *           </a>
 *         </div>
 *       </div> 
 *     </div>
 *   </div>
 * </div>
 * ```
 */
export class SearchTablePageWrapper extends PageWrapper {
    protected override readonly mainTableQuery = "div.js-categories-seasonal";
    protected override readonly entriesQuery = "div.js-anime-category-producer.seasonal-anime";
    protected override readonly statusButtonQuery = "a.js-anime-watch-status";
    protected override readonly entryNameQuery = "h2.h2_anime_title > a";
    protected override readonly notWatchedStatusClass = "notinmylist";
}

/**
 * Page wrapper for single entry page.
 * 
 * ```
 * // Page structure:
 * <div id="contentWrapper"> // Div wrapper for title and content blocks
 *   <div> // Title div
 *      <div> // Several div layers
 *        <h1 class="title-name ..."> // Entry title block
 *          <strong>ENTRY_NAME</strong> // Entry title text
 *        </h1>
 *      </div>
 *   </div>
 *   <div id="content"> // Content div
 *     <table> // Several table and div layers
 *       <div class="anime-detail-header-stats ..."> // Main details for the entry
 *         ...
 *         <div class="user-status-block ..."> // Entry status block
 *           ...
 *           // Entry status button if entry is not in list
 *           <a id="myinfo_status" class="... myinfo_addtolist">Add to list</a>
 *           // Entry status button if entry is in list
 *           // (still present but invisible when not in list)
 *           <select id="myinfo_status" class="... myinfo_updateInfo">
 *             <option selected="selected" value="1">Watching</option>
 *             <option value="2">Completed</option>
 *             ...
 *           </select>
 *         </div>
 *       </div>
 *     </table>
 *   </div>
 * </div>
 * ```
 */
export class SingleEntryPageWrapper extends PageWrapper {
    protected override readonly mainTableQuery = "div.anime-detail-header-stats";
    protected override readonly entriesQuery = "div.user-status-block";
    protected override readonly statusButtonQuery = "#myinfo_status"
    protected override readonly entryNameQuery = "h1.title-name";
    protected override readonly notWatchedStatusClass = "myinfo_addtolist";

    protected override getEntries(mainTable: MainTable): Entry[] {
        return Array.from(mainTable.querySelectorAll<Entry>(this.entriesQuery))
            .filter(x => x.style.display != "none");
    }

    public override getEntryName(_entry: Entry): string {
        return document.querySelector(this.entryNameQuery).textContent;
    }
}
