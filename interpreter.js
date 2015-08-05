"use strict";

var R = require('require-parts')('ramda', 'src', ['keys','countBy', 'mapObjIndexed', 'values', 'pipe', 'sort', 'map']);

var getTLIdEncoderDecoder = require("get_tlid_encoder_decoder");

var tLIdEncoderDecoder = getTLIdEncoderDecoder(new Date(2015, 6, 29).getTime(), 5);

function Intr() {
    this._d = {};
}

Intr.encode = function(l) {
    return tLIdEncoderDecoder.encode(l.getTime());
}

Intr.decode = function(k) {
    return new Date(tLIdEncoderDecoder.decode(k));
}

Intr.prototype.push = function(id, data) {
    this._d[id] = data;
};

Intr._getConstructionMap = R.pipe(
    R.keys,
    R.countBy(function(s) { return s.substr(2) }),
    R.mapObjIndexed(function(v, k) { return [k, v > 1]; }),
    R.values,
    R.sort(function(a, b) {
        return tLIdEncoderDecoder.sort(b[0], a[0]);
    })
);

Intr.prototype.get = function(id, data) {
    var r = [],
        consMap = Intr._getConstructionMap(this._d),
        tmp = {},
        i = 0;

    var mapper = function(m) {
        var dk = 'c-' + m[0];
        var rr = {
            "Connect Time": Intr.decode(m[0]).toISOString(),
            "Response Time": null,
            "Request Length": null,
            "Request Headers": this._d[dk].headers,
            "Method": this._d[dk].method,
            "Request Body": this._d[dk].body,
            "Target": this._d[dk].target,
            "Status": "On Going"
        };
        if (m[i][1]) {
        }
        return rr;
    }.bind(this);

    return R.map(mapper, consMap);
};

module.exports = Intr;
