// imports

var Hashids = require("hashids"),
    ConfigFactory = require('../services/configFactory');

// module variables

var settings = ConfigFactory.instance(),
    hashids = new Hashids(settings.get('idSalt'), settings.get('idLength'));

module.exports = function() {
    return hashids.encode(Math.round(Math.random() * 999999999));
};
