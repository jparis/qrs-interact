var nock = require('nock');
var promise = require('bluebird');
var qrsInteractMain = require('../qrsInteract');

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
var xrfkeyParam = "xrfkey=" + xrfkey;

var defaultHeaders = {
    'X-Qlik-Xrfkey': xrfkey,
    'X-Qlik-User': 'UserDirectory=Internal;UserId=sa_api',
    'Content-Type': 'application/json'
};

requestDefaultParams = {
    method: '',
    path: '',
    rejectUnauthorized: false,
    host: 'test.factory',
    port: '443',
    headers: defaultHeaders,
    gzip: true,
    json: true
};

var qrsInteractInstance = new qrsInteractMain(requestDefaultParams.host, requestDefaultParams.port, "", xrfkeyParam, requestDefaultParams);

var allTestPromises = [];

// test case 1

var test1Return = {
    buildVersion: '3.0.2.0',
    buildDate: '9/20/2013 10:09:00 AM',
    databaseProvider: 'Devart.Data.PostgreSql',
    nodeType: 1,
    schemaPath: 'About'
};

var scope = nock('https://test.factory')
    .get('/qrs/about' + '?' + xrfkeyParam)
    .reply(200, test1Return);

allTestPromises.push(qrsInteractInstance.Get('about').then(function(result) {
    if (JSON.stringify(result.body) != JSON.stringify(test1Return)) {
        throw "testcase 1 failed - Get returned wrong result.";
    } else {
        console.log("testcase 1 passed - Get");
        return "Passed";
    }
}));



// test case 2

var test2Return = {
    id: "2454e69a-d2fe-4d1a-bc64-52c5b4232e87",
    createdDate: "2016-09-28T16:20:39.982Z",
    modifiedDate: "2016-09-28T16:20:39.982Z",
    modifiedByUserName: "INTERNAL\\sa_api",
    name: "tagTest",
    privileges: null,
    schemaPath: "Tag"
};

var scope = nock('https://test.factory')
    .post('/qrs/tag' + '?' + xrfkeyParam, {
        "id": "2454e69a-d2fe-4d1a-bc64-52c5b4232e87",
        "name": "tagTest",
        "privileges": null
    })
    .reply(201, test2Return);

allTestPromises.push(qrsInteractInstance.Post('tag', {
    id: "2454e69a-d2fe-4d1a-bc64-52c5b4232e87",
    name: "tagTest",
    privileges: null
}, 'json').then(function(result) {
    if (JSON.stringify(result.body) != JSON.stringify(test2Return)) {
        throw "testcase 2 failed - Post returned wrong result.";
    } else {
        console.log("testcase 2 passed - Post");
        return "Passed";
    }
}));



// test case 3

var test3Return = [{
    id: "1234e69a-d2fe-4d1a-bc64-52c5b4232e87",
    createdDate: "2016-09-28T16:20:39.982Z",
    modifiedDate: "2016-09-28T16:20:39.982Z",
    modifiedByUserName: "INTERNAL\\sa_api",
    name: "tag1",
    privileges: null,
    schemaPath: "Tag"
}, {
    id: "4321e69a-d2fe-4d1a-bc64-52c5b4232e87",
    createdDate: "2016-09-28T16:20:39.982Z",
    modifiedDate: "2016-09-28T16:20:39.982Z",
    modifiedByUserName: "INTERNAL\\sa_api",
    name: "tag2",
    privileges: null,
    schemaPath: "Tag"
}];

var scope = nock('https://test.factory')
    .get('/qrs/tag' + '?' + xrfkeyParam)
    .reply(200, test3Return);

allTestPromises.push(qrsInteractInstance.Get('tag').then(function(result) {
    return result.body[0].name;
}).then(function(name) {
    if (name != "tag1") {
        throw "testcase 3 failed - Get returned wrong result.";
    } else {
        console.log("testcase 3 passed - Get array");
        return "Passed";
    }
}));



// test case 4

var test4Return = "someStringBuffer";

var scope1 = nock('https://test.factory')
    .get('/tempcontent/someContent' + '?' + xrfkeyParam)
    .reply(200, test4Return);

var scope2 = nock('https://test.factory')
    .get('/qrs/tempcontent/someContent' + '?' + xrfkeyParam)
    .reply(404, "Not Found");

allTestPromises.push(qrsInteractInstance.Get('tempcontent/someContent').then(function(result) {
    if (result.body != test4Return) {
        throw "testcase 4 failed - Get returned wrong result.";
    } else {
        console.log("testcase 4 passed - Get");
        return "Passed";
    }
}).catch(function(err) {
    throw "testcase 4 failed:" + err;
}));



// test case 5

var scope = nock('https://test.factory')
    .delete('/qrs/user/2414e19a-d2fe-5d1a-fc64-52c5b4232e87' + '?' + xrfkeyParam)
    .reply(204, "");

allTestPromises.push(qrsInteractInstance.Delete('user/2414e19a-d2fe-5d1a-fc64-52c5b4232e87').then(function(result) {
    if (result.statusCode != 204) {
        throw "testcase 5 failed - Delete returned wrong status code.";
    } else {
        console.log("testcase 5 passed - Delete");
        return "Passed";
    }
}).catch(function(err) {
    throw "testcase 5 failed:" + err;
}));



// Cleanup

promise.allSettled(allTestPromises).catch(function(allErrors) {
    console.log(allErrors);
    process.exit(1);
});