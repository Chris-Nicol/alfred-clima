'use strict';
const alfy = require('alfy');

//fetches the weather for Valencia
alfy.fetch('https://api.darksky.net/forecast/b3bfdcda400630b909f112b1530aea93/37.8267,-122.4233', {
    query: {
        q: alfy.input
    }
}).then(data => {
    let dayName = '';
    let displayTemperature = '';

	const items = data.results
    .map(x => {
        const date = new Date(x.time*1000); //API time format is UNIX ... needs to be *1000 to be ticks
        const high = x.temperatureHigh;
        const low = x.temperatureLow;
        

        dayName += date.getDayName();
        displayTemperature += getFormattedTemperatures(high, low);

        return {
            title: date.getDayName(),
            arg: getFormattedTemperatures(high, low),
            icon: {
                path: ' ' // Hide icon
            }
        };
    });

items.push({
    title: dayName,
    arg: displayTemperature,
    icon: {
        path: ' '
    }
});

alfy.output(items);

});


//returns formatted high/low temperatures for display
function getFormattedTemperatures(high, low) {
    return ('↑☝️ ' + high + "° | 👇↓ " + low + "°");        
};

//Overrides Date object to retrieve the name of the day of the week
(function() {
    var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    Date.prototype.getDayName = function(){
        return days[this.getDay()];
    };
})();
