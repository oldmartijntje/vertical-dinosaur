const logging = [];

function writeLog(value, locationMarker = null, logToConsole = false) {
    if (logToConsole) {
        console.log(`Log from: '${locationMarker}'`, value)
    }
    logging.unshift({ "locationMarker": locationMarker, "log": value, "moment": new Date() });
}