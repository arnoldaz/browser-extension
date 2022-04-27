import React, { ChangeEventHandler, useState } from "react";
import { TempStorage } from "../utils/storage";
import "./popup.css";

export default function Popup(): JSX.Element {
    const [count, setCount] = useState(0);

    const handleChange: ChangeEventHandler<HTMLInputElement> = async (e) => {
        console.log("Toggle: " + e.target.checked);
        await TempStorage.toggleHide(e.target.checked);
    }

    return (
        <div className={"popup-test"}>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
            <label>
                <input type="checkbox" onChange={handleChange}/>
                Toggle hide
            </label>
        </div>
    );
}
