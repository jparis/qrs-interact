var nock = require('nock');
var qrsInteractMain = require('../qrsInteract');
var request = require('request');


// test setup

var generateXrfKey = function() {
    var xrfString = "";
    for (i = 0; i < 16; i++) {
        if (Math.floor(Math.random() * 2) == 0) {
            xrfString += Math.floor(Math.random() * 10).toString();
        } else {
            var charNumber = Math.floor(Math.random() * 26);
            if (Math.floor(Math.random() * 2) == 0) {
                //small letter
                xrfString += String.fromCharCode(charNumber + 97);
            } else {
                xrfString += String.fromCharCode(charNumber + 65);
            }
        }
    }
    return xrfString;
}

var xrfkey = generateXrfKey();
var xrfkeyParam = "xrfkey="+xrfkey;

var qrsInteractInstance = new qrsInteractMain("http://test.factory", xrfkeyParam, request);



// test case 1

var scope = nock('http://test.factory')
    .get('/about' + '?' + xrfkeyParam)
    .reply(200, {info: "about endpoint valid"});

qrsInteractInstance.Get('about').then(function(result){
    console.log(result)
});

// test case 2