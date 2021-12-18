import Typography from '@mui/material/Typography';

export default function StopPointArrivalDetails({ arrival, currentDate }) {
    // {timeToStation} {modeName} {lineName} towards {destinationName} expected at {expectedArrival}
    const expected = new Date(arrival.expectedArrival);
    const ttsDiff = expected - currentDate;
    const ttsSeconds = ttsDiff / 1000
    const ttsMinutes = Math.floor(ttsSeconds / 60);
    const tts = ttsMinutes < 1 ? 'Now' : ttsMinutes + 'm';

    const normalizeStation = (station) => {
        const trims = [
            ' Rail Station',
            ' Underground Station',
        ];

        trims.forEach((trim) => {
            if (station.endsWith(trim)) {
                station = station.substring(0, station.length - trim.length);
            }
        });

        return station;
    };

    return (
        <Typography>
            <img
                alt={arrival.modeName}
                style={{'maxHeight': '1em', 'display': 'inline'}}
                src={process.env.PUBLIC_URL + "/" + arrival.modeName + ".svg"}
            />
            &nbsp;{tts} - {arrival.modeName === 'bus' && arrival.lineName} to {normalizeStation(arrival.destinationName)} @ {arrival.expectedArrival.substring(11, 16)}
        </Typography>
    );
}

