var hisenseTV = require('hisense-remote');
var inherits = require('util').inherits;
var Service, Characteristic;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-hisensetv", "HisenseTV", hisenseTvAcc);
}


function hisenseTvAcc(log, config) {
    this.log = log;
    this.config = config;
    this.name = config["name"];
    this.ip_address = config["ip_address"];
    
    if (!this.ip_address) throw new Error("You must provide a config value for 'ip_address'.");
    
    this.remote = new hisenseTV({
        ip: this.ip_address // ip address of your hisense smart tv
    });
    this.tries = config['tries'] || 5;
    this.tryInterval = config['tryInterval'] || 1000;
    this.service = new Service.Switch(this.name);
    
    this.service
        .getCharacteristic(Characteristic.On)
        .on('get', this._getOn.bind(this))
        .on('set', this._setOn.bind(this));
}


hisenseTvAcc.prototype.getInformationService = function() {
    var informationService = new Service.AccessoryInformation();
    informationService
        .setCharacteristic(Characteristic.Name, this.name)
        .setCharacteristic(Characteristic.Manufacturer, 'Hisense TV')
        .setCharacteristic(Characteristic.Model, '1.0.0')
        .setCharacteristic(Characteristic.SerialNumber, this.ip_address);
    return informationService;
};

hisenseTvAcc.prototype.getServices = function() {
    return [this.service, this.getInformationService()];
};

hisenseTvAcc.prototype._getOn = function(callback) {
    var accessory = this;
    this.remote.isAlive(function(err) {
        if (err) {
             callback(null, false);
        } else {
            accessory.log.debug('TV is On!');
            callback(null, true);
        }
    });
};

hisenseTvAcc.prototype._setOn = function(on, callback) {
  var self = this;
  this.log("Sending on/off command to '" + this.name + "'...");
  
        for (var i = 0; i < this.tries; i++) {
        setTimeout(function() {
          self.remote.powerOn();
        }, i * this.tryInterval);
      }
      
      callback();
};