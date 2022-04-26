import React from "dom-chef";
import Content from "./components/content";

const updateUi: MutationCallback = (_mutations: MutationRecord[], _observer: MutationObserver): void => {
    const div = document.querySelector(".my_statistics > .widget-header");
    div.textContent = "Random test string!";

    console.log("Before div append");
    div.appendChild(<Content />);
    console.log("After div append");
};

const observer = new MutationObserver(updateUi);
observer.observe(document, { subtree: true, attributes: true });