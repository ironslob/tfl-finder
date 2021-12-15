import Typography from '@mui/material/Typography';

export default function StopPointArrivalDetails({ arrival, currentDate }) {
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
            {tts} <img alt={arrival.modeName} style={{'maxHeight': '1em'}} src={process.env.PUBLIC_URL + "/" + arrival.modeName + ".svg"} />{arrival.modeName === 'bus' && arrival.lineName} to {normalizeStation(arrival.destinationName)} @ {arrival.expectedArrival.substring(11, 16)}
        </Typography>
    );
}

