'use strict';
const alfy = require('alfy');

module.exports.saveConfiguration = function(config){

	//ensure some value is attempting to be stored
	if (config.value === undefined | config.value == ''){
		return 'Error: Invalid configuration, please enter a value to store.';
	}
    
	//validate format of specific configs
	switch(config.type){
	case 'Dark Sky API Token':
		if(config.value.length != 32){
			return 'Error: Invalid Dark Sky API Token';
		}
		break;
	case 'Google Maps API Token':
		if(config.value.length != 39){
			return 'Error: Invalid Google Maps API Token';
		}
		break;
	case 'Default Location':
		var locationQuery = this.parseLocationQuery(config.value);
		if(locationQuery === undefined){
			return 'Error: Invalid default location, enter city, country or Google Maps coordinates.';
		}
		break;
	}

	//save to cache and return success message
	alfy.cache.set(config.type, config.value);
	return 'Your ' + config.type + ' has been stored successfully.';
};

//fetch Token from config by type (DarkSkyToken | GoogleMapsToken)
module.exports.getConfiguration = function(configType){
	var configValue = alfy.cache.get(configType);

	if (!configValue){
		if (configType == 'Default Location'){
			throw ('There is no default location, specify a location address or coordinates.s');
		} else {
			throw ('Error: ' + configType + ' not found. Please check your settings');
		}
	}

	return configValue;
};

//parse input for a location value and type
module.exports.parseLocationQuery = function(query){
	let mapCoordinatesReg = /(\d{1,3}[\.]\d*)[, ]+-?(\d{1,3}[\.]\d*)/;
	let locationReg = /^([1-zA-Z0-1@.,-\s]{1,255})$/;

	var locationQuery = new Object();

	if (mapCoordinatesReg.test(query)) {
		locationQuery.type = 'latlng';
		locationQuery.value = query;
	} else if (locationReg.test(query)) {
		locationQuery.type = 'address';
		locationQuery.value = query;
	} else {
		throw ('Please enter valid location coordinates or an address.');
	} 

	return locationQuery;
};

//send error to output 
module.exports.error = function(errorMessage){

	alfy.output([{
		title: errorMessage,
		subtitle: 'Press ⏎ for help on setting up Clima',
		valid: true,
		text: {
			errorMessage,
			largetype: errorMessage
		},
		icon: {
			path: 'icons/error.png'
		}
	}]);
};