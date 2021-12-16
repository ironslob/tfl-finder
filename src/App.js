import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import StopPoint from './components/StopPoint';
import AddStopModal from './components/AddStopModal';

function App() {
    const [displayStops, setDisplayStops] = useState(JSON.parse(localStorage.getItem("displayStops")) || []);
    const [displayIds, setDisplayIds] = useState([]);

    useEffect(() => {
        localStorage.setItem("displayStops", JSON.stringify(displayStops));
        setDisplayIds(displayStops.map(function (stop) { return stop.id }));
    }, [displayStops]);

    const deleteStop = (stopId) => {
        const newDisplayStops = displayStops.filter((stop) => stop.id !== stopId);
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
                        currentIds={displayIds}
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
