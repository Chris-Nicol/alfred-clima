'use strict';
const alfy = require('alfy');
const baseUrl = 'https://api.darksky.net/forecast/';
const token = 'b3bfdcda400630b909f112b1530aea93/'; //Need to get token from a workflow and cache 
const location = '39.4699075,-0.3762881'; // need to get log-lat from Google Maps API (will need a token for google maps)
const excludes = '?exclude=minutely,hourly&units=auto';
const url = getDarkSkyAPIUrl();



//fetches the weather for Valencia
alfy.fetch(url).then(data => {
    const items = data.daily.data
        .map(x => {
            const date = new Date(x.time*1000);
            var high = (x.temperatureHigh | 0);
            var low = (x.temperatureLow | 0);
            var units = data.flags.units;

            return {
                title: date.getDayName() + ":  " + getFormattedTemperatures(high, low),
                subtitle:  getSummary(x.summary, units, x),
                icon: {
                    path: getIconByType(x.icon, units, x)
                }
            }
        });

    
	alfy.output(items);
});


//returns formatted high/low temperatures for display
function getFormattedTemperatures(high, low) {
    return ('↑ ' + high + "°  |  ↓ " + low + "°");        
};

//Overrides Date object to retrieve the name of the day of the week
(function() {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    Date.prototype.getDayName = function(){
        return days[this.getDay()];
    };
})();

//Overrides the Number object to decide if a number is between two numbers or not
Number.prototype.between = function(a, b, inclusive) {
    var min = Math.min(a, b),
      max = Math.max(a, b);
  
    return inclusive ? this >= min && this <= max : this > min && this < max;
}

//returns the complete url for Dark Sky API
function getDarkSkyAPIUrl(){
    return baseUrl+token+location+excludes;
}

//return icon for weather type
function getIconByType(icontype, units, data){
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

function getSummary(summary, units, data) {
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

    alfy.log("Probabilty value: " + data.precipProbability);
    alfy.log("Summary: " + summary);
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
