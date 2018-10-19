'use strict';
const alfy = require('alfy');
const utils = require('./js/utilities');
const formatting = require('./js/formatting');
const baseUrl = 'https://api.darksky.net/forecast/';
const excludes = '?exclude=minutely,hourly&units=auto';

//fetches the weather, based on input or default settings
try {
    
    var mapsAPIKey = alfy.cache.get('Google Maps API Token');
    var locationQuery;

    if (alfy.input)
    {
        locationQuery = utils.parseLocationQuery(alfy.input);
    } else {
        locationQuery = utils.parseLocationQuery(utils.getConfiguration('Default Location'));
    }

    if (mapsAPIKey){
        //Use google maps to determine location and get weather
        getWeatherThroughGoogleMaps(locationQuery);
    } else if (locationQuery.type == 'latlng'){
        //Get weather using only coordinates and setting the location address to "Unknown"
        getWeather(locationQuery.value, 'Unknown');
    } else{
        //Trying to get weather without a maps key and without using valid coordinates is not supported
        throw('Without a Google Maps API Key, you must specify coordinates (xx,xxxx, -yy,yyyy).')
    }
} catch (error) {
    utils.error(error);
}

function getWeather(locationCoordinates, locationAddress){
    
    var darkSkyToken = utils.getConfiguration('Dark Sky API Token');
    var url = baseUrl + darkSkyToken + '/' + locationCoordinates + excludes;

    alfy.fetch(url).then(data => {
        
        //grab the current weather
        var currentItem = getCurrentForecast(data.currently, locationAddress, data);
        
        //grab the 7 day forecast
        var items = data.daily.data
            .map(x => {
                const date = new Date(x.time*1000);
                var high = (x.temperatureHigh | 0);
                var low = (x.temperatureLow | 0);
                var units = data.flags.units;
    
                return {
                    title: date.getDayName() + ":  " + formatting.getFormattedTemperatures(high, low),
                    valid: false,
                    subtitle:  formatting.getSummary(x.summary, units, x),
                    icon: {
                        path: formatting.getIconByType(x.icon, units, x)
                    }
                }
            });
        
        //add current weather as first item in the array
        items.unshift(currentItem);
        
        alfy.output(items);
    });
}

function getWeatherThroughGoogleMaps(locationQuery){

    var mapsAPIKey = utils.getConfiguration('Google Maps API Token');
    var mapsURL = 'https://maps.googleapis.com/maps/api/geocode/json?'+ locationQuery.type + '=' + locationQuery.value + '&key=' + mapsAPIKey;
    
    alfy.fetch(mapsURL).then(data => {
    
        switch (data.status) {
            case 'REQUEST_DENIED':
                alfy.error('The provided API key is invalid.');
                break;
            case 'INVALID_REQUEST':
                alfy.error('We could not parse a location or coordinates from your input. Please enter valid coordinates or a location name.');
                break;
            case 'OK':
                var location = data.results[0].geometry.location;
                getWeather(location.lat + ', ' + location.lng, data.results[0].formatted_address);
                break;
        }
    });
}

//returns the current forecast in alfred JSON output
function getCurrentForecast(current, locationAddress, data){
   
    var temp = (current.temperature | 0);
    var units = data.flags.units;

    return { 
        title: locationAddress,
        subtitle: 'Currently ' + temp + '° and ' + formatting.getSummary(current.summary, units, data).toLowerCase(),
        valid: false,
        icon: {
            path: 'icons/current-location.png'
        },
    }
}

//********************** OVERRIDES  **********************\\

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