import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";

import OptionsTable, { Data } from "./options";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserStorage } from "../utils/storage";



function convertData(dataSet: Set<string>): Data[] {
    var data: Data[] = [];
    var i = 0;
    dataSet.forEach(value => data.push({ id: i++, name: value }));
    return data;
}

function Options() {
    const [ignoredNames, setIgnoredNames] = React.useState<readonly Data[]>([]);
    
    useEffect(() => {
        const setInitialIgnoredNamesValue = async () => {
            setIgnoredNames(convertData(await BrowserStorage.getIgnoredNames()));
        }

        setInitialIgnoredNamesValue();
    }, []);

    return (
        // @ts-ignore
        <ThemeProvider theme={createTheme({ palette: { mode: "dark" }})}>
            <CssBaseline />
            {// @ts-ignore
                <OptionsTable
                    ignoredNames={ignoredNames}
                >

                </OptionsTable>
            }

        </ThemeProvider>

    );
}

createRoot(document.getElementById("options-root")).render(<Options />);