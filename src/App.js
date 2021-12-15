// https://api.tfl.gov.uk/StopPoint?stopTypes=CarPickupSetDownArea%2CNaptanAirAccessArea%2CNaptanAirEntrance%2CNaptanAirportBuilding%2CNaptanBusCoachStation%2CNaptanBusWayPoint%2CNaptanCoachAccessArea%2CNaptanCoachBay%2CNaptanCoachEntrance%2CNaptanCoachServiceCoverage%2CNaptanCoachVariableBay%2CNaptanFerryAccessArea%2CNaptanFerryBerth%2CNaptanFerryEntrance%2CNaptanFerryPort%2CNaptanFlexibleZone%2CNaptanHailAndRideSection%2CNaptanLiftCableCarAccessArea%2CNaptanLiftCableCarEntrance%2CNaptanLiftCableCarStop%2CNaptanLiftCableCarStopArea%2CNaptanMarkedPoint%2CNaptanMetroAccessArea%2CNaptanMetroEntrance%2CNaptanMetroPlatform%2CNaptanMetroStation%2CNaptanOnstreetBusCoachStopCluster%2CNaptanOnstreetBusCoachStopPair%2CNaptanPrivateBusCoachTram%2CNaptanPublicBusCoachTram%2CNaptanRailAccessArea%2CNaptanRailEntrance%2CNaptanRailPlatform%2CNaptanRailStation%2CNaptanSharedTaxi%2CNaptanTaxiRank%2CNaptanUnmarkedPoint%2CTransportInterchange&lat=51.4383257&lon=-0.0666983&radius=500

// https://api.tfl.gov.uk/StopPoint/{id}/Arrivals
//
// find stop points
// https://api.tfl.gov.uk/StopPoint/Search\?query\=Forest+Hill

// for overground use
// forest hill
// https://api.tfl.gov.uk/StopPoint/910GFORESTH/Arrivals

// for buses, iterate over the children and pull their data
// pull https://api.tfl.gov.uk/StopPoint/$id
// pull the children element
// for each child you need to pull the lineGroup
// get the naptanIdReference
// query 
// https://api.tfl.gov.uk/StopPoint/${naptanIdReference}/Arrivals

/*
 * 1 - use search by stop point
 * 2 - display list of points
 * 3 - when adding a stop point query for the StopPoint/$id
 * 4 - depending on the type of stop - bus, overground etc. - you need ot pull out different IDs, and possibly add several to the list
 */
import { useState, useMemo, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { throttle } from 'lodash';

function StopPointArrivalDetails({ arrival, currentDate }) {
    // {timeToStation} {modeName} {lineName} towards {destinationName} expected at {expectedArrival}
    const expected = new Date(arrival.expectedArrival);
    const ttsDiff = expected - currentDate;
    const ttsSeconds = ttsDiff / 1000
    const ttsMinutes = Math.floor(ttsSeconds / 60);
    const tts = ttsMinutes < 1 ? 'Now' : ttsMinutes + 'm';

    const normalizeStation = (station) => {
        if (station.endsWith(' Rail Station')) {
            station = station.substring(0, station.length - 13)
        }

        return station;
    };

    return (
        <Typography>
            {tts} <img style={{'maxHeight': '1em'}} src={process.env.PUBLIC_URL + "/" + arrival.modeName + ".svg"} />{arrival.modeName === 'bus' && arrival.lineName} to {normalizeStation(arrival.destinationName)} @ {arrival.expectedArrival.substring(11, 16)}
        </Typography>
    );
}

/*
function StopPointArrivals({ stopPointId }) {
    const [arrivals, setArrivals] = useState(null);

    useEffect(() => {
        fetch('https://api.tfl.gov.uk/StopPoint/' + stopPointId + '/Arrivals')
            .then(response => response.json())
            .then(data => setArrivals(data))
    }, [stopPointId]);

    return (
        <>
            {arrivals === null ? (<p>Loading</p>) : arrivals.map(function(arrival) {
                return (<StopPointArrivalDetails arrival={arrival} />);
            })}
        </>
    );
}
*/

function StopPoint({ stopPoint, onDelete }) {
    const [stopDetails, setStopDetails] = useState(null);
    const [stationCodes, setStationCodes] = useState(null);
    const [arrivals, setArrivals] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [tickDate, setTickDate] = useState(new Date());

    useEffect(() => {
        const setTimer = () => {
            const timer = setTimeout(() => {
                console.log('tick');
                setTickDate(new Date());
                setTimer();
            }, 30000);

            return () => clearTimeout(timer);
        };

        return setTimer();
    });

    useEffect(() => {
        const setTimer = () => {
            const timer = setTimeout(() => {
                refreshArrivals();
                setTimer();
            }, 300000);

            return () => clearTimeout(timer);
        };

        return setTimer();
    }, []);

    const refreshArrivals = () => {
        if (stationCodes !== null) {
            loadArrivals();
        }
    };

    const loadArrivals = () => {
        const fetchPromises = stationCodes.map(function(stationCode) {
            return fetch('https://api.tfl.gov.uk/StopPoint/' + stationCode + '/Arrivals')
                .then(response => response.json())
        });

        Promise.all(fetchPromises).then(results => {
            let newArrivals = [].concat.apply([], results);
            const idMap = newArrivals.reduce(function(accum, currentVal) {
                accum[currentVal.id] = currentVal;
                return accum;
            }, {});
            newArrivals = Object.values(idMap);

            newArrivals.sort(function(a, b) {
                return a.timeToStation - b.timeToStation;
            });

            setArrivals(newArrivals);
            setLastUpdate(new Date());
        });
    };

    useEffect(() => {
        if (stationCodes !== null) {
            loadArrivals();
            /*
            stationCodes.forEach(function(stationCode) {
                fetch('https://api.tfl.gov.uk/StopPoint/' + stationCode + '/Arrivals')
                    .then(response => response.json())
                    .then(data => {
                        console.log(arrivals);
                        console.log(data);

                        let newArrivals = [...arrivals, ...data];
                        newArrivals.sort(function(a, b) {
                            return a.timeToStation - b.timeToStation;
                        });
                        console.log(newArrivals);

                        setArrivals(newArrivals);
                    });
            });
            */
        }
    }, [stationCodes]);

    useEffect(() => {
        if (stopDetails) {
            const newStationCodes = stopDetails.lineGroup.map(function (lineGroup) {
                return lineGroup.naptanIdReference || lineGroup.stationAtcoCode;
            });

            setStationCodes(newStationCodes);
        }
    }, [stopDetails]);

    useEffect(() => {
        fetch('https://api.tfl.gov.uk/StopPoint/' + stopPoint.id)
            .then(response => response.json())
            .then(data => setStopDetails(data))
    }, [stopPoint]);

    return (
        <Grid item xs={6}>
            <Card>
                <CardContent>
                    <Typography variant="h4">
                        {stopPoint.name}
                    </Typography>
                    <Box style={{'height': '300px', 'overflow': 'auto'}}>
                        {arrivals === null ?
                            (<CircularProgress />) :
                            arrivals.map(function(arrival) {
                                return (
                                    <StopPointArrivalDetails
                                        key={arrival.id}
                                        arrival={arrival}
                                        currentDate={tickDate}
                                    />
                                );
                            })
                        }
                    </Box>
                </CardContent>
                <CardActions>
                    {lastUpdate && (
                    <Typography>
                        Last updated: {lastUpdate.getHours()}:{lastUpdate.getMinutes()}
                    </Typography>
                    )}
                    <Button onClick={() => refreshArrivals()}>Refresh</Button>
                    <Button onClick={() => onDelete()} variant="error">Delete</Button>
                </CardActions>
            </Card>
        </Grid>
    );
}

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
    }, [search, updateOptions]);

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
                                            <img style={{'maxHeight': '1em'}} src={process.env.PUBLIC_URL + "/" + mode + ".svg"} />
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
