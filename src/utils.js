import { 
    transportTube,
    transportBus,
    transportNationalRail,
    transportOverground,
    transportDLR,
    transportTFLRail,
} from './constants';

const uniqueArray = (array) => {
    const mapped = array.reduce(function(accum, currentVal) {
        accum[currentVal] = true;
        return accum;
    }, {});
    return Object.keys(mapped);
};

const identifyLineIdentifier = (ident) => {
    const constainsNumber = /\d/.test(ident);

    if (constainsNumber) {
        return transportBus;
    }

    const undergroundLines = [
        'bakerloo',
        'central',
        'circle',
        'district',
        'hammersmith-city',
        'jubilee',
        'metropolitan',
        'northern',
        'piccadilly',
        'victoria',
        'waterloo-city',
    ];

    if (undergroundLines.includes(ident)) {
        return transportTube;
    }

    const nationalRailIdents = [
        'national-rail',
        // others
        'thameslink',
        'southern',
        'south-western-railway',
    ];

    if (nationalRailIdents.includes(ident)) {
        return transportNationalRail;
    }

    if (ident === 'london-overground' || ident === 'overground') {
        return transportOverground;
    } else if (ident === 'dlr') {
        return transportDLR;
    } else {
        console.log('unknown ident ' + ident);
    }
    
    return transportTFLRail;   // guess work
};

const identifyLineGroup = (lineGroup) => {

    return lineGroup.lineIdentifier.map(identifyLineIdentifier);
};

export {
    uniqueArray,
    identifyLineIdentifier,
    identifyLineGroup,
};
