# qrs-interact
QRS Interact is a simple javascript library that allows users to send queries to the Qlik Sense Repository Service.

###Getting Started

####   Installing
```npm install qrs-interact```


####   Usage
To use the qrs-interact module, first you must create a new instance.
```var <variableName> = new qrsInteract(<someHostname>);```

Once you have initialized an instance, GET, POST, PUT, and DELETE all return promises. They can be used as follows.
```<instanceName>.Get(<somePath>)
    .then(function(result)
    {
        // do some work
    })
    .catch(function(error)
    {
        // catch the error
    });
    ```

#####   Example
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