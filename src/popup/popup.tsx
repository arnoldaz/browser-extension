import React, { useEffect, useState } from "react";
import { BrowserStorage } from "../utils/storage";
import "./popup.css";

export default function Popup(): JSX.Element {
    const [hideWatchedValue, setHideWatchedValue] = useState<boolean>(null);
    const [ignoredNames, setIgnoredNames] = useState<string[]>(null);

    useEffect(() => {
        const setInitialCheckValue = async () => 
            setHideWatchedValue(!await BrowserStorage.getEntriesVisible());

        setInitialCheckValue();
    }, []);

    useEffect(() => {
        const setInitialIgnoredNamesValue = async () => 
            setIgnoredNames([...await BrowserStorage.getIgnoredNames()]);

        setInitialIgnoredNamesValue();
    }, []);

    const handleHideWatchedChanged = async (checked: boolean) => {
        setHideWatchedValue(checked);
        await BrowserStorage.setEntriesVisible(!checked);
    };

    const handleListEntryClick = async (name: string) => {
        setIgnoredNames(ignoredNames.filter(x => x != name));
        await BrowserStorage.removeIgnoredName(name);
    };

    return (
        <div className="popup-main">
            <label className="popup-checkbox">
                <input type="checkbox" checked={hideWatchedValue} onChange={e => handleHideWatchedChanged(e.target.checked)} />
                Hide watched and not interested
            </label>
            <h3>
                Ignored entries list
            </h3>
            {ignoredNames && ignoredNames.length > 0 
                ? 
                <ul className="popup-list">
                    {ignoredNames.map((name) => {
                        return <li key={name} onClick={() => handleListEntryClick(name)}>{name}</li>;
                    })}
                </ul>
                :
                <p className="popup-list-empty">
                    <i>Empty</i>
                </p>
            }
            <a href={`data:text/html,${JSON.stringify(ignoredNames)}`} download="mal-extension-export.json">
                <button>Export</button>
            </a>
        </div>
    );
}
