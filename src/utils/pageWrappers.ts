
/** Callback type for iterating through entries. */
export type EntryCallback = (entry: Entry, entryName: string, statusButton: StatusButton, isStatusInList: boolean, statusButtonParent: StatusButtonParent) => void;

/** Main table HTML element type. */
export type MainTable = HTMLElement;
/** Single entry HTML element type. */
export type Entry = HTMLElement;
/** Status button HTML element type. */
export type StatusButton = HTMLElement;
/** Parent of status button HTML element type. */
export type StatusButtonParent = HTMLElement;

/**
 * Helper function to get page wrapper for current page by trying all possibilities.
 * @returns Page wrapper instance if load succeded, null otherwise.
 */
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

/** Base page wrapper instance for querying various part of the page. */
export abstract class PageWrapper {
    protected mainTables: MainTable[];
    protected entries: Entry[];

    protected abstract readonly mainTableQuery: string;
    protected abstract readonly entriesQuery: string;
    protected abstract readonly statusButtonQuery: string;
    protected abstract readonly entryNameQuery: string;
    protected abstract readonly notWatchedStatusClass: string;

    public abstract readonly notInterestedStatusClass: string;
    public readonly notInterestedStatusParentClass: string;

    /**
     * Tries to load the page into the wrapper.
     * @returns True if page was successfully loaded, false otherwise.
     */
    public tryLoadPage(): boolean {
        const mainTables = this.getMainTables();
        if (mainTables.length < 1)
            return false;

        this.mainTables = mainTables;
        this.entries = this.getEntries(mainTables);
        return true;
    }

    /**
     * For each implementation for page entries.
     * @param callback Callback to call for each entry with additional useful parameters.
     */
    public forEachEntry(callback: EntryCallback): void {
        this.entries.forEach(entry => {
            const entryName = this.getEntryName(entry);
            const statusButton = this.getStatusButton(entry);
            const isStatusInList = this.isStatusWatched(statusButton);
            const statusButtonParent = statusButton.parentNode as StatusButtonParent;
            callback(entry, entryName, statusButton, isStatusInList, statusButtonParent);
        });
    }

    /**
     * Gets a list of main tables by querying currently open document.
     * @returns List of main tables.
     */
    public getMainTables(): MainTable[] {
        return Array.from(document.querySelectorAll<MainTable>(this.mainTableQuery));
    }

    /**
     * Gets a list of entries by querying main tables.
     * @param mainTables List of main tables to query.
     * @returns List of entries.
     */
    public getEntries(mainTables: MainTable[]): Entry[] {
        return mainTables
            .map(mainTable => Array.from(mainTable.querySelectorAll<Entry>(this.entriesQuery)))
            .reduce((accumulator, singleTableEntries) => accumulator.concat(singleTableEntries), []);
    }

    /**
     * Gets status button by querying entry of status button parent.
     * @param entry Entry or status button parent.
     * @returns Status button.
     */
    public getStatusButton(entry: Entry | StatusButtonParent): StatusButton {
        return entry.querySelector<StatusButton>(this.statusButtonQuery);
    }

    /**
     * Gets entry name by querying entry and parsing its text content.
     * @returns Entry name string.
     */
    public getEntryName(entry: Entry): string {
        return entry.querySelector(this.entryNameQuery).textContent;
    }

    /**
     * Gets whether watch status button has watched status.
     * @param watchStatusButton Status button to check for status.
     * @returns True if status button is watched status (watching, completed, etc) or is marked as not interested.
     */
    public isStatusWatched(watchStatusButton: StatusButton): boolean {
        return watchStatusButton.classList.contains(this.notInterestedStatusClass)
            || !watchStatusButton.classList.contains(this.notWatchedStatusClass)
    }

    /**
     * Gets custom list of elements that should be removed or hidden, e.g. ads.
     * @returns List of unnecessary HTML elements.
     */
    public getRemovableElements(): HTMLElement[] {
        return [];
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
 *       <a class="js-anime-watch-status ...">Watching</a>
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

    public override readonly notInterestedStatusClass = "not-interested-status-top-table";
}

/**
 * Page wrapper for seasonal or search result pages.
 * 
 * ```
 * // Page structure:
 * <div class="seasonal-anime-list ..."> // Main table for all the entries
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
    protected override readonly mainTableQuery = "div.seasonal-anime-list";
    protected override readonly entriesQuery = "div.js-anime-category-producer.seasonal-anime";
    protected override readonly statusButtonQuery = "a.js-anime-watch-status";
    protected override readonly entryNameQuery = "h2.h2_anime_title > a";
    protected override readonly notWatchedStatusClass = "notinmylist";

    public override readonly notInterestedStatusClass = "not-interested-status-search-table";

    private readonly seasonalMiddleAdQuery = "div.js-middle_ad";

    public override getRemovableElements(): HTMLElement[] {
        return this.mainTables
            .map(mainTable => Array.from(mainTable.querySelectorAll<HTMLElement>(this.seasonalMiddleAdQuery)))
            .reduce((accumulator, singleTableMiddleAds) => accumulator.concat(singleTableMiddleAds), []);
    }

    // const tables = this.findSearchTables();
    // const seasonalAds: HTMLElement[] = [];
    // tables?.forEach(table => 
    //     table.querySelectorAll<HTMLElement>(this.seasonalMiddleAdQuery)
    //         .forEach(entry => seasonalAds.push(entry))
    // );

    // return seasonalAds;
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

    public override readonly notInterestedStatusClass = "not-interested-status-single-entry";
    public override readonly notInterestedStatusParentClass = "not-interested-status-parent-single-entry";

    public override getEntries(mainTables: MainTable[]): Entry[] {
        if (mainTables.length > 1)
            console.error("There is more than 1 table in single entry page, defaulting to first table anyways");

        return Array.from(mainTables[0].querySelectorAll<Entry>(this.entriesQuery))
            .filter(entry => entry.style.display != "none");
    }

    public override getEntryName(_entry: Entry): string {
        return document.querySelector(this.entryNameQuery).textContent;
    }
}
