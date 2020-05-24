# Status
[![Project Status: Inactive – The project has reached a stable, usable state but is no longer being actively developed; support/maintenance will be provided as time allows.](https://www.repostatus.org/badges/latest/inactive.svg)](https://www.repostatus.org/#inactive)
[![CircleCI](https://circleci.com/gh/jparis/qrs-interact.svg?style=shield)](https://circleci.com/gh/jparis/qrs-interact/)  
[![NPM](https://nodei.co/npm/qrs-interact.svg)](https://nodei.co/npm/qrs-interact/)

## qrs-interact
QRS Interact is a simple javascript library that allows users to send queries to the Qlik Sense Repository Service.

### Getting Started

For more information and advanced usage, please reference the [wiki](https://github.com/eapowertools/qrs-interact/wiki).

#### Installing
```bash
npm install qrs-interact
```


#### Usage
To use the qrs-interact module, first you must create a new instance.
```js
var instance = new qrsInteract('<someHostname>');
```

Once you have initialized an instance, GET, POST, PUT, and DELETE all return promises. They can be used as follows.
```js
instance.Get('<somePath>')
    .then(function(result)
    {
        // do some work
    })
    .catch(function(error)
    {
        // catch the error
    });
```

##### Example
```js
var qrsInteract = require('qrs-interact');

var instance1 = new qrsInteract("abc.qlik.com");

instance1.Get('about')
    .then(function(result)
    {
        console.log(result);
    })
    .catch(function(error)
    {
        console.log(error);
    });
```
