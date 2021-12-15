import { useState, useMemo, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { throttle } from 'lodash';
import StopPoint from './components/StopPoint';

function App() {
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState([]);
    const [displayStops, setDisplayStops] = useState(JSON.parse(localStorage.getItem("displayStops")) || []);
    const [displayIds, setDisplayIds] = useState([]);

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
        localStorage.setItem("displayStops", JSON.stringify(displayStops));
        setDisplayIds(displayStops.map(function (stop) { return stop.id }));
    }, [displayStops]);

    useEffect(() => {
        if (search.length >= 2) {
            updateOptions(search, (results) => {
                let matches = results.matches
                    .filter(function (match) {
                        return (displayIds.indexOf(match.id) === -1);
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
    }, [search, updateOptions, displayIds]);

    const deleteStop = (stopId) => {
        const newDisplayStops = displayStops.filter((stop) => stop.id !== stopId);
        setDisplayStops(newDisplayStops);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Autocomplete
                        id="foobar"
                        sx={{ width: 300 }}
                        filterOptions={(x) => x}
                        getOptionLabel={(option) =>
                            typeof option === 'string' ? option : option.name
                        }
                        autoComplete
                        filterSelectedOptions
                        includeInputInList
                        value={search}
                        options={options}
                        onChange={(event, newValue) => {
                            if (newValue) {
                                // take .id from newValue
                                setDisplayStops([...displayStops, newValue]);
                                setSearch("");
                            }
                        }}
                        onInputChange={(event, newInputValue) => {
                            setSearch(newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField {...params} label="Add a location" fullWidth variant="outlined" />
                        )}
                        renderOption={(props, option, { selected }) => {
                            return (
                                <li {...props}>
                                    {option.name}
                                    {option.modes.map(function (mode) {
                                        return (
                                            <img
                                                style={{'maxHeight': '1em'}}
                                                src={process.env.PUBLIC_URL + "/" + mode + ".svg"}
                                                alt={mode}
                                            />
                                        );
                                    })}
                                </li>
                            );
                        }}
                    />
                </Toolbar>
            </AppBar>
            <Grid container spacing={2}>
                {displayStops.map(function(displayStop) {
                    return (
                        <StopPoint
                            key={displayStop.id}
                            stopPoint={displayStop}
                            onDelete={() => deleteStop(displayStop.id)}
                        />
                    );
                })}
            </Grid>
        </Box>
    );
}

export default App;
