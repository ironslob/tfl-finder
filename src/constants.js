const transportTube = 'tube';
const transportBus = 'bus';
const transportNationalRail = 'national-rail';
const transportOverground = 'overground';
const transportDLR = 'dlr';
const transportTFLRail = 'tflrail';

const transportModeLabels = {
    transportTube: 'Tube',
    transportBus: 'Bus',
    transportNationalRail: 'National Rail',
    transportOverground: 'Overground',
    transportDLR: 'DLR',
    transportTFLRail: 'TFL Rail',
};

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
