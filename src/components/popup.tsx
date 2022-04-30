import React, { ChangeEventHandler, useEffect, useState } from "react";
import { BrowserStorage } from "../utils/storage";
import "./popup.css";

export default function Popup(): JSX.Element {
    const [hideWatchedValue, setHideWatchedValue] = useState<boolean>(null);
    const [ignoredNames, setIgnoredNames] = useState<string[]>();
    const [count, setCount] = useState(0);

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

    const handleChange: ChangeEventHandler<HTMLInputElement> = async ({ target }) => {
        setHideWatchedValue(target.checked);
        await BrowserStorage.setEntriesVisible(!target.checked);
    };

    const handleListClick = async (e: React.MouseEvent<Element, MouseEvent>, name: string) => {
        await BrowserStorage.removeIgnoredName(name);
        setIgnoredNames(ignoredNames.filter(x => x != name));
    };

    return (
        <div className={"popup-test"}>
            <label>
                <input type="checkbox" checked={hideWatchedValue} onChange={handleChange} />
                Hide watched and not interested
            </label>
            {/* <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button> */}
            {ignoredNames && 
                <ul>
                    {ignoredNames.map((name) => {
                        return <li onClick={e => handleListClick(e, name)}>{name}</li>;
                    })}
                </ul>
            }
        </div>
    );
}
