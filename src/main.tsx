import React from "dom-chef";
import Content from "./components/content";

let once = true;

const findTopTable = async () => {
    console.log("ABC");
    const table = document.querySelector("table.top-ranking-table");
    if (!table)
        return;

    if (!once)
        return;

    once = false;

    console.log("DEF");
    const entries = table.querySelectorAll<HTMLElement>("tr.ranking-list");

    entries.forEach((value, _key, _parent) => {
        if (value.querySelector("a.js-anime-watch-status:not(.notinmylist)")) {
            value.style.display = "none";
        }
        else {
            const button = value.querySelector("a.js-anime-watch-status")
            button.parentNode.appendChild(<Content />);
        }
    });
};

const updateUi: MutationCallback = async (_mutations: MutationRecord[], _observer: MutationObserver): Promise<void> => {
    findTopTable();
    const div = document.querySelector(".my_statistics > .widget-header");
    if (!div)
        return;

    div.textContent = "Random test string!";

    console.log("Before div append");
    div.appendChild(<Content />);
    console.log("After div append");
};

const observer = new MutationObserver(updateUi);
observer.observe(document, { subtree: true, attributes: true });

browser.storage.onChanged.addListener((changes, areaName) => {
    console.log(changes);
    const a = changes["toggle"];
    console.log(a);

    const check = a.newValue as boolean;
    console.log("new: ", check);
    const table = document.querySelector("table.top-ranking-table");
    if (!table)
        return;

    console.log("table");

    const entries = table.querySelectorAll<HTMLElement>("tr.ranking-list");
    console.log("entries");
    entries.forEach((value, _key, _parent) => {
        if (value.querySelector("a.js-anime-watch-status:not(.notinmylist)")) {
            value.style.display = check ? "none" : "";
            console.log("found display", value.style.display);
        }
    });
})