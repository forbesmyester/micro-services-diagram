"use strict";

var R = require('require-parts')('ramda', 'src', ['keys','countBy', 'mapObjIndexed', 'values', 'pipe', 'sort', 'map']);

var getTLIdEncoderDecoder = require("get_tlid_encoder_decoder");

var tLIdEncoderDecoder = getTLIdEncoderDecoder(require('./config.js').baseDate, 5);

function Intr() {
    this._d = {};
}

Intr.encode = function(l) {
    return tLIdEncoderDecoder.encode(l);
}

Intr.decode = function(k) {
    return tLIdEncoderDecoder.decode(k);
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

Intr.getColumns = function() {
    return [
        "Connect Time",
        "Request Headers",
        "Method",
        "Request Body",
        "Target",
        "Status",
        "Response Time",
        'Response Body',
        'Response Headers',
        'Response Time'
    ];
};

Intr.prototype.get = function(id, data) {
    var r = [],
        consMap = Intr._getConstructionMap(this._d),
        tmp = {},
        i = 0;

    var mapper = function(m) {
        var ck = 'c-' + m[0],
            dk = 'd-' + m[0],
            rr = {
                "Connect Time": new Date(Intr.decode(m[0])).toISOString(),
                "Response Time": null,
                "Request Headers": this._d[ck].headers,
                "Method": this._d[ck].method,
                "Request Body": this._d[ck].body ? this._d[ck].body : null,
                "Target": this._d[ck].target,
                "Status": "On Going"
            };

        if (m[1]) {
            rr['Status'] = 'Complete';
            rr['Response Body'] = this._d[dk].resp;
            rr['Response Headers'] = this._d[dk].headers;
            rr['Response Time'] = this._d[dk].time - Intr.decode(m[0]) + 'ms';
        }

        return rr;
    }.bind(this);

    return R.map(mapper, consMap);
};

module.exports = Intr;
