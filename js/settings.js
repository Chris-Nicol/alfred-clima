'use strict';
const alfy = require('alfy');
const utils = require('./utilities');


//Parse input to get config type and value
var config = parseInput(alfy.input);

//save config
var message = utils.saveConfiguration(config);

//Return message for success/error
console.log(message);

function parseInput(input){
    var splitInput = input.split('|');
    
    var config = new Object();
    config.type = splitInput[0];
    config.value = splitInput[1];

    return config;
}