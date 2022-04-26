import React, { useState } from "react";
import "./popup.css";

export default function Popup(): JSX.Element {
    const [count, setCount] = useState(0);

    return (
        <div className={"popup-test"}>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
                Click me
            </button>
        </div>
    );
}
