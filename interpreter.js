"use strict";

var getTLIdEncoderDecoder = require("get_tlid_encoder_decoder");

var tLIdEncoderDecoder = getTLIdEncoderDecoder(new Date(2015, 6, 29).getTime(), 5);

function Intr() {
    this._d = {};
}

Intr._keyFromTime = function(l, d) {
    return l + '-' + tLIdEncoderDecoder.encode(d);
}

Intr._timeFromKey = function(k) {
    tLIdEncoderDecoder.decode(k.substr(2));
}

Intr.prototype.push = function(id, data) {
};

Intr.prototype.get = function(id, data) {
};

module.exports = Intr;
