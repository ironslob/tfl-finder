import { useState, useMemo, useEffect } from 'react';
import { throttle } from 'lodash';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { transportModeLabels, allTransportModes } from '../constants';

export default function AddStopModal({ onChoose, open, onClose, currentIds, clearOnChoose = true }) {
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState(null);
    const [modes, setModes] = useState(allTransportModes);
    const [stations, setStations] = useState([]);

    const updateOptions = useMemo(
        () =>
            throttle((search, callback) => {
                const url = 'https://api.tfl.gov.uk/StopPoint/Search?query=' + encodeURIComponent(search);
                fetch(url)
                    .then(response => response.json())
                    .then(data => callback(data));
            }, 200),
        [],
    );

    useEffect(() => {
        if (search.length >= 2) {
            updateOptions(search, (results) => {
                let matches = results.matches
                    .filter(function (match) {
                        return (currentIds.indexOf(match.id) === -1);
                    })
                    .map(function (match) {
                        return {
                            modes: match.modes,
                            id: match.id,
                            name: match.name,
                            lat: match.lat,
                            lon: match.lon,
                        };
                    });

                matches.sort(function (a, b) {
                    if (a.name < b.name) {
                        return -1;
                    }

                    if (a.name > b.name) {
                        return 1;
                    }

                    return 0;
                });

                setOptions(matches);
            });
        } else {
            setOptions([]);
        }
    }, [search, updateOptions, currentIds]);

    const toggleMode = (mode) => {
        const idx = modes.indexOf(mode);

        if (idx !== -1) {
            setModes([...modes.slice(0, idx), ...modes.slice(idx+1)]);
        } else {
            setModes([...modes, mode]);
        }
    };

    const toggleStation = (station) => {
        let newStations = stations.filter(function (existing) {
            return existing.id !== station.id;
        });

        if (newStations.length === stations.length) {
            newStations.push(station);
        }

        setStations(newStations);
    };

    const [stationIds, setStationIds] = useState([]);

    useEffect(() => {
        setStationIds(stations.map(function (stop) { return stop.id }));
    }, [stations]);

    const cleanup = () => {
        setSearch("");
        setOptions(null);
        setStations([]);
    };

    const handleConfirm = () => {
        onChoose(stations);
        cleanup();
    };

    const handleClose = () => {
        onClose();
        cleanup();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add new station stop</DialogTitle>
            <DialogContent>
                <Stack spacing={3}>
                    <DialogContentText>
                        Add a new station / stop to the list by searching below,
                        ticking which stations to add, then click "Confirm".
                    </DialogContentText>
                    <FormGroup row={true}>
                        {allTransportModes.map(function(mode) {
                            return (
                                <FormControlLabel
                                    key={mode}
                                    control={
                                        <Checkbox
                                            checked={modes.indexOf(mode) !== -1}
                                            onChange={() => toggleMode(mode)}
                                        />
                                    }
                                    label={transportModeLabels[mode]}
                                />
                            );
                        })}
                    </FormGroup>
                    <TextField
                        label="Search location"
                        fullWidth
                        variant="outlined"
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </Stack>
                {options !== null && (
                <List>
                    {options.map(function (option) {
                        const modeOverlap = modes.some(value => option.modes.includes(value));
                        const chosen = currentIds.includes(option.id);

                        return (
                            <>
                                {(modeOverlap && !chosen) && (
                                <ListItem disablePadding key={option.id}>
                                    <ListItemButton
                                        onClick={() => toggleStation(option)}
                                        selected={stationIds.includes(option.id)}
                                    >
                                        <ListItemIcon>
                                            {option.modes.map(function (mode) {
                                                return (
                                                    <img
                                                        key={option.id + '-' + mode}
                                                        style={{'maxHeight': '1em'}}
                                                        src={process.env.PUBLIC_URL + "/" + mode + ".svg"}
                                                        alt={mode}
                                                    />
                                                );
                                            })}
                                        </ListItemIcon>
                                        <ListItemText primary={option.name} />
                                    </ListItemButton>
                                </ListItem>
                                )}
                            </>
                        );
                    })}
                </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button disabled={stations.length === 0} onClick={handleConfirm}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
}
