
//returns formatted high/low temperatures for display
module.exports.getFormattedTemperatures = function (high, low) {
    return ('↑ ' + high + "°  |  ↓ " + low + "°");        
};

//return icon for weather type
module.exports.getIconByType = function(icontype, units, data){
    var path = 'icons/';

    switch(icontype) {
        case 'clear-day':
            if(heatWarning(data.temperatureHigh, units))
                return path + 'sun-warning.png';
            else    
                return path + 'clear-day.png';
        case 'clear-night':
            return path + 'clear-night.png';
        case 'rain':
            return path + 'rain.png';
        case 'snow':
            return path + "snow.png";
        case 'sleet':
            return path + 'sleet.png';
        case 'wind':
            //should use units to decie what the wind warning threshold is in user's units
            if(windWarning(data.windGust, units))
                return path + 'wind-warning.png'
            else
                return path + 'wind.png';
        case 'fog':
            return path + 'fog.png';
        case 'cloudy':
            return path + 'cloudy.png';
        case 'partly-cloudy-day':
            if(heatWarning(data.temperatureHigh, units))
                return path + 'partly-cloudy-heat-warning.png'
            else
                return path + 'partly-cloudy-day.png';
        case 'partly-cloudy-night':
            return path + 'partly-cloudy-night.png';
        default:
            return path + 'default.png';
    }
}

module.exports.getSummary = function(summary, units, data) {
    var rainTypes = ['rain', 'partly-cloudy-day', 'partly-cloudy-night', 'cloudy'];

    //adds chance of rain, but only for forecasts that main contain rain
    if (rainTypes.includes(data.icon)){
        summary += ' ' + ((data.precipProbability * 100) | 0) + '% chance of rain.'
    }

    //adds chance of snow, but only for forecasts that main contain snow
    if (data.icon == 'snow' | data.icon == 'sleet'){
        summary += ' ' + ((data.precipProbability * 100) | 0) + '% chance of snow.'
    }

    //add heat warning if applicable
    if (heatWarning(data.temperatureHigh, units)){
        summary += ' Heat warning in affect.';
    }

    if (windWarning(data.windGust, units)){
        summary += ' Wind warning in affect.';
    }

    if (coldWarning(data.temperatureLow, units)){
        summary += ' Cold warning in affect.';
    }

    return summary;
}

//returns boolen for if there is a heat warning
function heatWarning(highTemp, units) {
    return (units == 'us') ? (highTemp > 95) : (highTemp > 33);
}

//returns boolean for if there is wind warning
function windWarning(windGust, units) {
    switch (units){
        case ('us' | 'uk2'):
            return (windGust > 31)
        case 'ca':
            return (windGust > 50)
        default:
            return (windGust > 13.5)
    }
}

//returns boolen for if there is a cold warning
function coldWarning(lowTemp, units) {
    return (units == 'us') ? (lowTemp < 0) : (lowTemp < -20);
}
