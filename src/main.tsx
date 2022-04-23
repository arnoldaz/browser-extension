const updateUi: MutationCallback = (_mutations: MutationRecord[], _observer: MutationObserver): void => {
    const div = document.querySelector(".my_statistics > .widget-header");
    div.textContent = "Random test string!";
};

const observer = new MutationObserver(updateUi);
observer.observe(document, { subtree: true, attributes: true });