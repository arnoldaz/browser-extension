import * as React from "react";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { DataGrid, GridColumnMenu, GridColumnMenuProps, GridRowSelectionModel, GridToolbarContainer, GridToolbarQuickFilter } from "@mui/x-data-grid";

import { BrowserStorage } from "../utils/storage";

/** Main entry point for extension options page UI. */
export default function OptionsPage() {
    /** List of ignored names to display with an addition of index for easier viewing. */
    const [ignoredNames, setIgnoredNames] = useState<readonly { id: number, name: string }[]>([]);

    /** List of indexes for currently selected rows. */
    const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);

    /** Whether delete confirmation window is open. */
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState<boolean>(false);

    useEffect(() => {
        const initializeIgnoredNames = async () => {
            const nameSet = await BrowserStorage.getIgnoredNames();

            let names: { id: number, name: string }[] = [];
            let i = 0;
            nameSet.forEach(name => names.push({ id: i++, name }));

            setIgnoredNames(names);
        }

        initializeIgnoredNames();
    }, []);

    /** Parses JSON file. Assumes that JSON contains just an array of strings. */
    const parseJsonFile = async (file: File): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = event => resolve(JSON.parse(event.target.result as string));
            fileReader.onerror = error => reject(error);
            fileReader.readAsText(file);
        })
    }

    /** Imports parsed entries from JSON file into the table and browser storage. */
    const importEntries = async (file: File): Promise<void> => {
        const newNames = await parseJsonFile(file);

        const updatedIgnoredNames = [...ignoredNames];
        let lastIndex = updatedIgnoredNames[updatedIgnoredNames.length - 1].id;
        newNames?.forEach(newName => {
            if (!updatedIgnoredNames.find(ignoredName => ignoredName.name === newName))
                updatedIgnoredNames.push({ id: ++lastIndex, name: newName });
        });
        setIgnoredNames(updatedIgnoredNames);

        await BrowserStorage.addIgnoredNames(newNames);
    }

    /** Deletes currently selected entries from the table and browser storage. */
    const onDeleteConfirmation = async (): Promise<void> => {
        const names = selectedRowIds.map(id => ignoredNames.find(ignoredName => ignoredName.id === id).name);
        setIgnoredNames([...ignoredNames].filter(ignoredName => !selectedRowIds.includes(ignoredName.id)));

        setDeleteConfirmationOpen(false);
        await BrowserStorage.removeIgnoredNames(names);
    };

    /** Custom DataGrid column menu to disable column removal functionality. */
    const customColumnMenu = (props: GridColumnMenuProps) => (
        <GridColumnMenu {...props}
            slots={{ columnMenuColumnsItem: null }}
        />
    );

    /** Custom DataGrid toolbar with just the search and custom buttons. */
    const customToolbar = () => (
        <GridToolbarContainer sx={{ p: 0.5, pb: 0, ml: 0.5, mt: 0.5 }}>
            <GridToolbarQuickFilter />
            <Button variant="text" component="label" startIcon={<FileUploadIcon />} size="small">
                Import
                <input type="file" accept="application/JSON" hidden onChange={event => importEntries(event.target.files[0])} />
            </Button>
            <Button variant="text" startIcon={<DeleteIcon />} size="small" disabled={selectedRowIds.length === 0}
                onClick={() => setDeleteConfirmationOpen(true)}>
                Delete selection
            </Button>
        </GridToolbarContainer>
    );

    return (
        <ThemeProvider theme={createTheme({ palette: { mode: "dark" } })}>
            <CssBaseline />

            <Box sx={{ height: "100vh", width: "100%" }}>
                <DataGrid
                    rows={ignoredNames}
                    columns={[
                        {
                            field: "id", headerName: "ID",
                            width: 90,
                            editable: false, sortable: true, hideable: false,
                        },
                        {
                            field: "name", headerName: "Name",
                            flex: 1,
                            editable: false, sortable: true, hideable: false,
                        },
                    ]}
                    rowHeight={25}
                    pageSizeOptions={[100]}
                    checkboxSelection
                    sx={{ 
                        // Custom overrides to disable focused cell and column outlines
                        "& .MuiDataGrid-columnHeader:focus-within": { outline: "none" },
                        "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus": { outline: "none" },
                    }}
                    slots={{ columnMenu: customColumnMenu, toolbar: customToolbar }}
                    onRowSelectionModelChange={setSelectedRowIds}
                    rowSelectionModel={selectedRowIds}
                />
            </Box>

            <Dialog
                open={deleteConfirmationOpen}
                onClose={() => setDeleteConfirmationOpen(false)}>
                <DialogTitle>
                    Delete confirmation
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you really want to delete {selectedRowIds.length} selected entries from storage?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmationOpen(false)}>
                        No
                    </Button>
                    <Button onClick={() => onDeleteConfirmation()} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
