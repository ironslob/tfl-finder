import { useCallback, useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import StopPointArrivalDetails from './StopPointArrivalDetails';

export default function StopPoint({ stopPoint, onDelete }) {
    const [stopDetails, setStopDetails] = useState(null);
    const [stationCodes, setStationCodes] = useState(null);
    const [arrivals, setArrivals] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [tickDate, setTickDate] = useState(new Date());

    const loadArrivals = useCallback(() => {
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
    }, [stationCodes]);

    const refreshArrivals = useCallback(() => {
        if (stationCodes !== null) {
            loadArrivals();
        }
    }, [loadArrivals, stationCodes]);

    useEffect(() => {
        const setTimer = () => {
            const timer = setTimeout(() => {
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
    }, [refreshArrivals]);

    useEffect(() => {
        refreshArrivals();
    }, [refreshArrivals]);

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
