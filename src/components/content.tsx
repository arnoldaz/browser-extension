import React from "dom-chef";
import NotInterestedIcon from "../images/not-interested.svg";

export default function Content(): JSX.Element {
    return (
        <div id={"content-test"}>
            <button className="not-interested-button">
                <img src={NotInterestedIcon} style={{filter: "invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)"}} />
            </button>
        </div>
    );
}
