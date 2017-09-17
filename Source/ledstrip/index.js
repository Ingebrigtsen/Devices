function setupWifi(ip) {

    var wifi = require("Wifi");
    var ssid = "The Ingebrigtsens";
    var password = "Agei1208";

    wifi.connect(ssid, { password: password, ip: ip }, function () {
        console.log("Connected");
        wifi.setIP({ ip: ip, gw: "10.0.1.1", netmask: "255.255.255.0" }, function (e) {
            console.log("IP set");
            wifi.save();
        });
    });
}


var port = 80;
var numberOfLights = 81;
var gpio = NodeMCU.D4;

pinMode(D4, "output");

var pos = 0;
var rgb = new Uint8ClampedArray(numberOfLights * 3);

function getPattern() {
    pos = (pos + 1) % numberOfLights;

    rgb[pos * 3 + 0] = 170;
    rgb[pos * 3 + 1] = 0;
    rgb[pos * 3 + 2] = 255;

    for (var i = 0; i < numberOfLights * 3; i++)
        rgb[i] *= 0.9;

    return rgb;
}


function initialize() {
    console.log("Initialize");

    var neopixel = require("neopixel");

    function processRequest(req, res) {
        clearInterval();
        console.log("Request : " + req.url);
        req.on("data", function (data) {
            console.log("Received data");
        });

        var turnOn = req.url.indexOf("off") > 0 ? false : true;
        if (turnOn) {
            setInterval(function () {
                require("neopixel").write(gpio, getPattern());
            }, 50);
        } else {
            var value = req.url.indexOf("off") > 0 ? 0 : 255;
            var n = 0;
            for (var i = 0; i < numberOfLights; i++) {
                rgb[n++] = 0;
                rgb[n++] = 0;
                rgb[n++] = 0;
            }
            neopixel.write(gpio, rgb);
        }

        res.writeHead(200);
        res.end("Turning " + turnOn ? "on" : "off");
    }
    var http = require('http');
    http.createServer(processRequest).listen(port);
}


E.on("init", function () {
    pinMode(D4, "output");
    console.log("INIT");
    setupWifi("10.0.1.202");
    initialize();
});

setupWifi("10.0.1.202");
initialize();

