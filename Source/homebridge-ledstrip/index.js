var http = require("http");
var Service, Characteristic;

module.exports = function (homebridge) {

  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  this.state = false;

  homebridge.registerAccessory("homebridge-ledstrip", "LEDStrip", LEDStrip);
};

function LEDStrip(log, config) {
  this.log = log;
  this.config = config;
}


LEDStrip.prototype.getState = function (callback) {
  console.log("Getting state");
  callback(null, this.state);
};

LEDStrip.prototype.setState = function (state, callback) {

  this.state = state;
  console.log("Set state : " + state);

  var path = (state == true ? "" : "/off");
  http.get({ host: this.config.host, path: path }, function (response) {
    console.log("Response");
  });

  callback(null);
};

LEDStrip.prototype.getServices = function () {
  var informationService = new Service.AccessoryInformation();

  informationService
    .setCharacteristic(Characteristic.Manufacturer, "doLittle")
    .setCharacteristic(Characteristic.Model, "Ultimate LED Strip")
    .setCharacteristic(Characteristic.SerialNumber, "1-2-3-4-5")
    .setCharacteristic(Characteristic.FirmwareRevision, "v1.0.24");

  console.log("Exposing lightbulb called '"+this.config.name+"' located on host '"+this.config.host+"'");
  var lightbulbService = new Service.Lightbulb(this.config.name);
  lightbulbService
    .getCharacteristic(Characteristic.On)
    .on("get", this.getState.bind(this))
    .on("set", this.setState.bind(this))

  return [informationService, lightbulbService];
};