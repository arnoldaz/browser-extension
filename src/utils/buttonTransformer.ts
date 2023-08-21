import { Entry, PageWrapper, StatusButton, StatusButtonParent } from './pageWrappers';
import NotInterestedIcon from "../images/not-interested.svg";

export type NotInterestedButton = HTMLButtonElement;

export type NotInterestedClickCallback = (entry: Entry) => void;

/**
 * Helper function to set HTML element visibility.
 * @param element HTML element to set visibility for.
 * @param visible Whether element should be visible.
 */
export function setElementVisibleStatus(element: HTMLElement, visible: boolean): void {
    element.style.display = visible ? "" : "none";
}

export class ButtonTransformer {
    /** Text to set for "Not interested" button. */
    private readonly notInterestedButtonText = "Not interested";
    /** Class name to set for "Not interested" button. */
    private readonly notInterestedButtonClassName = "not-interested-button";

    private readonly notInterestedButtonQuery = `.${this.notInterestedButtonClassName}`;

    /**
     * Watch status button text before it was transformed into "Not interested" button.
     * It needs to be saved, since there is no other way to restore it into the previous state.
     * Since only entries not in list can be modified, all of them has the same text,
     * so only a single saved string is enough.
     */
    private originalStatusButtonText: string;

    public constructor(private pageWrapper: PageWrapper) { }

    /**
     * Transforms watch status button into "Not interested" button.
     * @param statusButton Watch status button to transform.
     */
    public transformNotInterestedStatusButton(statusButton: StatusButton): void {
        statusButton.classList.add(this.pageWrapper.notInterestedStatusClass);
        if (!this.originalStatusButtonText)
            this.originalStatusButtonText = statusButton.textContent;

        statusButton.textContent = this.notInterestedButtonText;
    }

    /**
     * Undo "Not interesting" status from given watch status button,
     * that was set using {@link transformNotInterestedStatusButton} function.
     * @param statusButton Watch status button to restore to original.
     */
    public undoNotInterestedStatusButton(statusButton: StatusButton): void {
        statusButton.classList.remove(this.pageWrapper.notInterestedStatusClass);
        if (!this.originalStatusButtonText) {
            console.error("originalStatusButtonText was never set, setting to default value");
            this.originalStatusButtonText = "Add to list";
        }

        statusButton.textContent = this.originalStatusButtonText;
    }

    /**
     * Adds new entry to not interested, transforms watch status into "Not interested"
     * and hides caller button.
     * @param notInterestedButton "Not interested" button that was clicked.
     * @param entry Parent entry to add to not interested.
     */
    private onNotInterestedClick(notInterestedButton: NotInterestedButton, entry: Entry, callback: NotInterestedClickCallback): void {
        const parent = notInterestedButton.parentNode as StatusButtonParent;
        const statusButton = this.pageWrapper.getStatusButton(parent);
        
        this.transformNotInterestedStatusButton(statusButton);
        setElementVisibleStatus(notInterestedButton, false);
        
        callback(entry);
    }

    /**
     * Creates "Not interested" HTML button.
     * @param entry Entry to bind on click action for.
     * @param visible Whether it should be instantly visible or hidden.
     * @returns Created button.
     */
    public createNotInterestedButton(entry: Entry, visible: boolean, callback: NotInterestedClickCallback): HTMLButtonElement {
        const button = document.createElement("button");
        button.classList.add(this.notInterestedButtonClassName);
        button.onclick = () => this.onNotInterestedClick(button, entry, callback);

        const buttonImage = document.createElement("img");
        buttonImage.src = NotInterestedIcon;
        button.appendChild(buttonImage);

        setElementVisibleStatus(button, visible);

        return button;
    }

    public getNotInterestedButton(statusButtonParent: StatusButtonParent): NotInterestedButton | null {
        return statusButtonParent.querySelector<NotInterestedButton>(this.notInterestedButtonQuery);
    }
}








