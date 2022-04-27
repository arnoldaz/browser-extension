import React from "dom-chef";
import NotInterestedIcon from "../images/not-interested.svg";

export default function Content(): JSX.Element {
    return (
        <button className="not-interested-button">
            <img src={NotInterestedIcon} />
        </button>
    );
}
