import React, { useEffect, useState } from "react";
import { BrowserStorage } from "../utils/storage";
import "./popup.css";

export default function Popup() {
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

    const downloadData = () => {
        return encodeURIComponent(JSON.stringify(ignoredNames, undefined, 2));
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
            <a href={`data:text/json;charset=utf-8,${downloadData()}`} download="mal-extension-export.json">
                <button>Export</button>
            </a>
            {/* <input type="file" onChange={(e) => {
                // getting a hold of the file reference
                var file = e.target.files[0]; 

                console.log(file);

                // setting up the reader
                var reader = new FileReader();
                reader.readAsText(file,'UTF-8');

                // here we tell the reader what to do when it's done reading...
                reader.onload = readerEvent => {
                    var content = readerEvent.target.result; // this is the content!
                    
                    var stringContent: string;

                    if (content instanceof ArrayBuffer)
                        stringContent = String.fromCharCode.apply(null, new Uint16Array(content));
                    else 
                        stringContent = content;

                    var object = JSON.parse(stringContent);

                    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
                        JSON.stringify(object)
                      )}`;
                      const link = document.createElement("a");
                      link.href = jsonString;
                      link.download = "data.json";
                  
                      link.click();
                }
            }}>

            </input> */}
        </div>
    );
}
