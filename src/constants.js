const transportTube = 'tube';
const transportBus = 'bus';
const transportNationalRail = 'national-rail';
const transportOverground = 'overground';
const transportDLR = 'dlr';
const transportTFLRail = 'tflrail';

const transportModeLabels = {};
transportModeLabels[transportTube] = 'Tube';
transportModeLabels[transportBus] = 'Bus';
transportModeLabels[transportNationalRail] = 'National Rail';
transportModeLabels[transportOverground] = 'Overground';
transportModeLabels[transportDLR] = 'DLR';
transportModeLabels[transportTFLRail] = 'TFL Rail';

const allTransportModes = Object.keys(transportModeLabels);

export {
    transportModeLabels,
    allTransportModes,
    transportTube,
    transportBus,
    transportNationalRail,
    transportOverground,
    transportDLR,
    transportTFLRail,
};
