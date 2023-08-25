import React, { useEffect, useState } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import Button from "@mui/material/Button";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { Typography } from "@mui/material";

import { BrowserStorage } from "../utils/storage";
import { EntryVisibilityStatus } from "../utils/entryVisiblityStatus";

import ExtensionIcon from "../images/favicon.svg";
import "./popup.css";

/** Main entry point for extension popup window UI. */
export default function Popup(): JSX.Element {
    const [entryVisiblity, setEntryVisibility] = useState<EntryVisibilityStatus>(EntryVisibilityStatus.Default);
    const [ignoredNames, setIgnoredNames] = useState<string[]>([]);
    const [visibleIgnoredNames, setVisibleIgnoredNames] = useState<string[]>([]);

    useEffect(() => {
        BrowserStorage.getEntryVisibility().then(value => setEntryVisibility(value));
    }, []);

    useEffect(() => {
        BrowserStorage.getIgnoredNames().then(value => setIgnoredNames([...value]));
    }, []);

    useEffect(() => {
        setVisibleIgnoredNames([...ignoredNames].reverse().slice(0, 5));
    }, [ignoredNames]);

    /** Gets full list of ignored names as a prettified and encoded JSON string. */
    const getExportData = () => encodeURIComponent(JSON.stringify(ignoredNames, undefined, 2));

    /** Gets extension version string from the manifest. */
    const getExtensionVersion = () => browser.runtime.getManifest().version;

    /** Opens extension options page. */
    const openExtensionSettingsPage = () => browser.runtime.openOptionsPage();

    /** Formats entry name by cutting off the end of the string if it's too long. */
    const formatEntryName = (name: string) => name.length < 30 ? name : (name.substring(0, 27) + "...")

    /**
     * Changes entry visibility status in UI and in browser storage.
     * @param newEntryVisibility Selected entry visibility status.
     */
    const handleEntryVisibilityChanged = async (newEntryVisibility: EntryVisibilityStatus) => {
        setEntryVisibility(newEntryVisibility);
        await BrowserStorage.setEntryVisibility(newEntryVisibility);
    };

    /**
     * Deletes entry name from UI and from browser storage.
     * @param deletedName Entry name to delete.
     */
    const handleEntryDeleteClick = async (deletedName: string) => {
        setIgnoredNames(ignoredNames.filter(name => name != deletedName));
        await BrowserStorage.removeIgnoredName(deletedName);
    };

    return (
        <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
            <CssBaseline />
            <main className="popup-main">
                <Box className="extension-icon-box center">
                    <img src={ExtensionIcon} width={50} height={50} />
                </Box>

                <Box className="extension-name-box center">
                    <Typography variant="h4" component="div">
                        <b>MAL extension</b>
                    </Typography>
                </Box>

                <Box className="extension-version-box center">
                    <Typography gutterBottom variant="caption" component="div">
                        v{getExtensionVersion()}
                    </Typography>
                </Box>

                <Box className="entry-visibility-box center">
                    <FormControl fullWidth size="small">
                        <InputLabel id="entry-visibility-label">Entry visibility</InputLabel>
                        <Select
                            labelId="entry-visibility-label"
                            label="Entry visibility"
                            value={entryVisiblity}
                            onChange={event => handleEntryVisibilityChanged(event.target.value as EntryVisibilityStatus)}>
                            <MenuItem value={EntryVisibilityStatus.Default}>Default</MenuItem>
                            <MenuItem value={EntryVisibilityStatus.NotInListOnly}>Only not in list visible</MenuItem>
                            <MenuItem value={EntryVisibilityStatus.HideNotInterestedOnly}>Only not interested hidden</MenuItem>
                            <MenuItem value={EntryVisibilityStatus.InListOnly}>Only in list visible</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <List subheader={<ListSubheader>Recently added not interested entries</ListSubheader>} dense>
                    {visibleIgnoredNames.map(name => {
                        return <ListItem
                            secondaryAction={
                                <IconButton edge="end" onClick={() => handleEntryDeleteClick(name)}>
                                    <DeleteIcon />
                                </IconButton>
                            }>
                            <ListItemText className="entry-name-text" primary={formatEntryName(name)} />
                        </ListItem>
                    })}
                </List>

                <Box className="center">
                    <a href={`data:text/json;charset=utf-8,${getExportData()}`}
                        download="mal-not-interested-extension-export.json">
                        <Button variant="text" startIcon={<FileDownloadIcon />} size="small" className="export-button">
                            Export
                        </Button>
                    </a>

                    <IconButton color="primary" onClick={() => openExtensionSettingsPage()}>
                        <SettingsIcon />
                    </IconButton>
                </Box>
            </main>
        </ThemeProvider>
    );
}
