[![CircleCI](https://circleci.com/gh/eapowertools/qrs-interact.svg?style=shield&circle-token=749f3baa48b5f018effe7fec24a75648b13cc226)](https://circleci.com/gh/eapowertools/qrs-interact/)  
[![NPM](https://nodei.co/npm/qrs-interact.png)](https://nodei.co/npm/qrs-interact/)

## qrs-interact
QRS Interact is a simple javascript library that allows users to send queries to the Qlik Sense Repository Service.

### Getting Started

For more information and advanced usage, please reference the [wiki](https://github.com/eapowertools/qrs-interact/wiki).

#### Installing
```npm install qrs-interact```


#### Usage
To use the qrs-interact module, first you must create a new instance.
```
var <variableName> = new qrsInteract(<someHostname>);
```

Once you have initialized an instance, GET, POST, PUT, and DELETE all return promises. They can be used as follows.
```
<instanceName>.Get(<somePath>)
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
```
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
