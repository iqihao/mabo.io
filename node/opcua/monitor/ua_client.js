/*

uglifyjs ua_client.js -b  --comments all > ua_client1.js
*/
var nconf = require("nconf");

var winston = require("winston");

var opcua = require("node-opcua");

var async = require("async");

nconf.file("config.json");

//console.log( nconf.get("logging"))
var logger = winston.loggers.add("server", {
    console: {
        //silent:true,
        level: "debug",
        colorize: "true",
        label: "server"
    },
    file: nconf.get("logging")
});

var endpointUrl = nconf.get("server").endpointUrl;

var client = new opcua.OPCUAClient();

//var sub1 = opcua.ClientSubscription();
var the_session = null;

var i = 0;

var t = new Date().getTime();

var tags = [ "ns=2;s=Channel1.Device1.fV1", "ns=2;s=Channel1.Device1.fV2", "ns=2;s=Channel1.Device1.MT", "ns=2;s=Channel1.Device1.Tag1", "ns=2;s=Channel1.Device1.Tag2", "ns=2;s=Channel1.Device1.test" ];

var read = function() {
    the_session.readVariableValue(//      nconf.get("server").tag_array,  //points array
    //TimestampsToReturn
    tags, function(err, dataValues, diagnostics) {
        //the_session.readVariableValue(["ns=2;s=Channel1.Device1.MT","ns=2;s=Channel1.Device1.Tag1"], function(err,dataValues,diagnostics) {
        if (!err) {
            dataValues.forEach(function(data, index) {
                console.log(tags[index]);
                console.log(data.value.value);
            });
            console.log("==============================");
        }
    });
};

async.waterfall([ function(callback) {
    client.connect(endpointUrl, function(err) {
        if (err) {
            console.log(" cannot connect to endpoint :", endpointUrl);
            callback("err");
        } else {
            console.log("connected !");
            callback(null, "connected");
        }
    });
}, function(status, callback) {
    console.log("createSession:", status);
    client.createSession(function(err, session) {
        if (err) {
            console.log("err:", err);
            callback("err");
        } else {
            the_session = session;
            //console.log("session:", the_session)
            callback(null, "session");
        }
    });
} ], function(err, result) {
    // result now equals 'done'    
    //assert(the_session)
    setInterval(read, 500);
    console.log("result:", result);
});