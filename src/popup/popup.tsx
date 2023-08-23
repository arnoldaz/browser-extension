import React, { useEffect, useState } from "react";
import { BrowserStorage } from "../utils/storage";
import "./popup.css";
import { EntryVisibilityStatus } from "../utils/entryVisiblityStatus";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import FormHelperText from '@mui/material/FormHelperText';

import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Switch from '@mui/material/Switch';
import WifiIcon from '@mui/icons-material/Wifi';
import BluetoothIcon from '@mui/icons-material/Bluetooth';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { TextField, Typography } from "@mui/material";

import MalIcon from "../images/myanimelist.svg";


export default function Popup() {
    const [entryVisiblity, setEntryVisibility] = useState<EntryVisibilityStatus>(EntryVisibilityStatus.Default);
    const [ignoredNames, setIgnoredNames] = useState<string[]>(null);

    useEffect(() => {
        BrowserStorage.getEntryVisibility().then(value => setEntryVisibility(value));
    }, []);

    useEffect(() => {
        BrowserStorage.getIgnoredNames().then(value => setIgnoredNames([...value]));
    }, []);

    const handleEntryVisibilityChanged = async (checked: boolean) => {
        // setEntryVisibility(checked);
        // await BrowserStorage.setEntriesVisible(!checked);
    };

    const handleListEntryClick = async (name: string) => {
        setIgnoredNames(ignoredNames.filter(x => x != name));
        await BrowserStorage.removeIgnoredName(name);
    };

    const downloadData = () => {
        return encodeURIComponent(JSON.stringify(ignoredNames, undefined, 2));
    };

    const getExtensionVersion = () => {
        const manifest = browser.runtime.getManifest();
        return manifest.version;
    }

    const [age, setAge] = React.useState(EntryVisibilityStatus.Default);

    const handleChange = (event: SelectChangeEvent) => {
        setAge(event.target.value as EntryVisibilityStatus);
    };



    return (
        <ThemeProvider theme={createTheme(
            {
                palette: { mode: "dark" },
                // components: {
                //     MuiButtonBase: {
                //         defaultProps: {
                //             // The props to apply
                //             disableRipple: true, // No more ripple, on the whole application 💣!
                //         },
                //     },
                // }
            })}>
            <CssBaseline />
            <main className="popup-main">

                {/* ///////////////////// */}


                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // height: "100vh"
                    marginTop: "25px"
                }}>
                    <img src={MalIcon} width={50} height={50} />

                </Box>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // height: "100vh"
                    marginTop: "10px"
                }}>

                    <Typography gutterBottom variant="h4" component="div">
                        <b>MAL extension</b>
                    </Typography>


                </Box>




                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} size="small">
                        Export
                    </Button>

                    <Button variant="outlined" startIcon={<FileUploadIcon />} size="small">
                        Import
                    </Button>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <IconButton color="primary">
                        <SettingsIcon />
                    </IconButton>
                </div>

                {/* ///////////////////// */}


                <div style={{
                    // display: 'flex',
                    // alignItems: 'center',
                    // justifyContent: 'center',
                    // height: "100vh"
                }}>

                    <Box sx={{ marginLeft: "10px", width: 250 }}>
                        <FormControl fullWidth size="medium">
                            <InputLabel id="demo-simple-select-label">Age</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={age}
                                label="Age"
                                onChange={handleChange}
                            >
                                <MenuItem value={EntryVisibilityStatus.Default}>Default</MenuItem>
                                <MenuItem value={EntryVisibilityStatus.NotInListOnly}>Only not in list visible</MenuItem>
                                <MenuItem value={EntryVisibilityStatus.HideNotInterestedOnly}>Only not interested hidden</MenuItem>
                                <MenuItem value={EntryVisibilityStatus.InListOnly}>Only in list visible</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    {/* <FormControl sx={{ m: 1, minWidth: 250 }} size="small">

                        <Select
                            labelId="test-select-label"
                            value={age}
                            onChange={handleChange}
                        >
                            <MenuItem value={EntryVisibilityStatus.Default}>Default</MenuItem>
                            <MenuItem value={EntryVisibilityStatus.NotInListOnly}>Only not in list visible</MenuItem>
                            <MenuItem value={EntryVisibilityStatus.HideNotInterestedOnly}>Only not interested hidden</MenuItem>
                            <MenuItem value={EntryVisibilityStatus.InListOnly}>Only in list visible</MenuItem>
                        </Select>
                    </FormControl> */}
                </div>

                {/* ///////////////////// */}


                <div style={{

                }}>
                    <List
                        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                        subheader={<ListSubheader>Settings</ListSubheader>} dense
                    >
                        <ListItem

                            secondaryAction={
                                <IconButton edge="end" aria-label="delete">
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText id="switch-list-label-wifi" primary="Wi-Fi" />

                        </ListItem>
                        <ListItem


                            secondaryAction={
                                <IconButton edge="end" aria-label="delete">
                                    <DeleteIcon />
                                </IconButton>
                            }
                        >
                            <ListItemText id="switch-list-label-bluetooth" primary="Bluetooth" />

                        </ListItem>
                    </List>
                </div>


                {/* <label className="popup-checkbox">
                    <input type="checkbox" checked={hideWatchedValue} onChange={e => handleEntryVisibilityChanged(e.target.checked)} />
                    Hide watched and not interested
                </label> */}
                {/* <h3>
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
                </a> */}
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
            </main>
        </ThemeProvider>

    );
}
