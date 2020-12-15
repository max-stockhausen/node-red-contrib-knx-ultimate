/**
* knxultimate-api
* (C) 2016-2019 Supergiovane
*/

const knxLog = require('./../KnxLog');

function hex2bin(hex) {
    return (parseInt(hex, 16).toString(2)).padStart(8, '0');
}

//
// DPT232: 3-byte RGB xyY
// The info about validity of Colour and Brighness are omitted.
//
exports.formatAPDU = function (value) {
    if (!value) {
        knxLog.get().error("DPT242: cannot write null value");
    } else {
        var apdu_data;
        if (typeof value == 'object' &&
            value.hasOwnProperty('x') && value.x >= 0 && value.x <= 65535 &&
            value.hasOwnProperty('y') && value.y >= 0 && value.y <= 65535 &&
            value.hasOwnProperty('brightness') && value.brightness >= 0 && value.brightness <= 100) {
        } else {
            knxLog.get().error("DPT232: Must supply an value {x:0-65535, y:0-65535, brightness:0-100}");
        }

        const bufferTotal = Buffer.alloc(6);
        const bufX = Buffer.alloc(2); //similar to malloc
        const bufY = Buffer.alloc(2); //similar to malloc
        const bufBrightness = Buffer.alloc(2); //similar to malloc
        bufX.writeUInt16BE(value.x); //buf.writeUInt16LE(number);
        bufY.writeUInt16BE(value.y);
        bufBrightness.writeUInt16BE(value.brightness);
        bufBrightness[0] = parseInt("00000011", 2).toString(16); // these are Colour and Brighness validities, omitted. (2 bit, both at 1)
        bufferTotal[0] = bufX[0];
        bufferTotal[1] = bufX[1];
        bufferTotal[2] = bufY[0];
        bufferTotal[3] = bufY[1];
        bufferTotal[4] = bufBrightness[0];
        bufferTotal[5] = bufBrightness[1];

        return bufferTotal;
    }
}

exports.fromBuffer = function (buf) {

    var bufTotale = buf.toString('hex');
    console.log("bufTotale STRINGA: " + bufTotale);
    var x = bufTotale.substring(0, 4);
    var y = bufTotale.substring(4, 8);
    var CB = bufTotale.substring(8, 10);// these are Colour and Brighness validities (2 bit) //00000011
    var brightness = bufTotale.substring(10, 12);
    var isColorValid = hex2bin(CB).substr(6, 7);
    var isBrightnessValid = hex2bin(CB).substr(7,8);
    ret = { x: parseInt(x, 16), y: parseInt(y, 16), brightness: parseInt(brightness, 16), isColorValid: Boolean(isColorValid), isBrightnessValid: Boolean(isBrightnessValid) };
    return ret;
}


exports.basetype = {
    "bitlength": 3 * 16,
    "valuetype": "basic",
    "desc": "RGB xyY",
    "help":
        `// Each color in a range between 0 and 65535 and brightness 0 and 100%
msg.payload={x:500, y:500, brightness:80};
return msg;`
}

exports.subtypes = {
    "600": {
        "desc": "RGB xyY", "name": "RGB color xyY",
        "unit": "", "scalar_range": [,],
        "range": [,]
    }
}
