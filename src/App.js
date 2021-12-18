import { useCallback, useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import StopPoint from './components/StopPoint';
import AddStopModal from './components/AddStopModal';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { 
    transportTube,
    transportBus,
    //transportNationalRail,
    transportOverground,
    //transportDLR,
    //transportTFLRail,
} from './constants';

const localStorageKey = "displayStops_1";
const maxStops = 20;
const uniqueArray = (array) => {
    const mapped = array.reduce(function(accum, currentVal) {
        accum[currentVal] = true;
        return accum;
    }, {});
    return Object.keys(mapped);
};

const identifyLineGroup = (lineGroup) => {
    const constainsNumber = lineGroup.lineIdentifier.some((ident) => /\d/.test(ident));

    if (constainsNumber) {
        return transportBus;
    }

    const ident = lineGroup.lineIdentifier[0];

    if (ident === 'london-overground') {
        return transportOverground;
    } else {
        console.log('unknown ident ' + ident);
    }
    
    return transportTube;   // guess work
};

function App() {
    const [displayStops, setDisplayStops] = useState(JSON.parse(localStorage.getItem(localStorageKey)) || []);
    const [stopStations, setStopStations] = useState(null);

    const loadStops = useCallback(() => {
        if (displayStops.length > 0) {
            const stopPointIds = uniqueArray(displayStops.map((stop) => stop.id)).join(",");

            fetch('https://api.tfl.gov.uk/StopPoint/' + stopPointIds)
                .then(response => response.json())
                .then(data => {
                    if (!(data instanceof Array)) {
                        data = [data];
                    }

                    // stopStations should be { displayStopId: stationIds }
                    let stopPointStations = {};

                    displayStops.forEach((stop) => {
                        // find the result related to this stop and mode
                        let lineGroups = data
                            .filter((row) => row.id === stop.id)
                            .map((row) => row.lineGroup)
                        ;

                        lineGroups = [].concat.apply([], lineGroups);

                        const stationCodes = lineGroups
                            .filter((lineGroup) => identifyLineGroup(lineGroup) === stop.mode)
                            .map((lineGroup) => lineGroup.naptanIdReference || lineGroup.stationAtcoCode);

                        stopPointStations[stop.id + "|" + stop.mode] = stationCodes;
                    });

                    setStopStations(stopPointStations);
                })
        }
    }, [displayStops]);

    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(displayStops));
        loadStops();
    }, [loadStops, displayStops]);

    const deleteStop = (remove) => {
        const newDisplayStops = displayStops.filter((stop) => !(stop.id === remove.id && stop.mode === remove.mode));
        setDisplayStops(newDisplayStops);
    };

    const [addStopOpen, setAddStopOpen] = useState(false);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Button
                        variant="outlined"
                        onClick={() => setAddStopOpen(true)}
                        color="inherit"
                        disabled={displayStops.length >= maxStops}
                    >
                        Add stop
                    </Button>
                    <AddStopModal
                        open={addStopOpen}
                        onClose={() => setAddStopOpen(false)}
                        onChoose={(e) => {
                            setDisplayStops([...displayStops, ...e]);
                            setAddStopOpen(false);
                        }}
                        currentStops={displayStops}
                    />
                    {displayStops.length === 0 && (
                        <Box style={{'display': 'flex'}}>
                            <KeyboardDoubleArrowLeftIcon/>
                            <Typography>
                                Click here to add station stops!
                            </Typography>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Grid container spacing={2}>
                {displayStops.map(function(displayStop) {
                    return (
                        <StopPoint
                            key={displayStop.id + "|" + displayStop.mode}
                            stopPoint={displayStop}
                            onDelete={() => deleteStop(displayStop)}
                            stopPointStations={stopStations ? stopStations[displayStop.id + "|" + displayStop.mode] : null}
                        />
                    );
                })}
            </Grid>
        </Box>
    );
}

export default App;
