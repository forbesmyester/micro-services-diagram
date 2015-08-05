"use strict";

var expect = require('expect.js'),
    Intr = require('../interpreter.js');


var times = [];

for (var i = 0; i < 100; i++) {
    times.push(Intr.encode(new Date(2014, 2, 2, 2, 2, i)));
}

describe('interpreter', function() {
    it('can prepare', function() {
        var ks = [
                'c-' + times[0],
                'c-' + times[5],
                'd-' + times[5],
                'c-' + times[2],
                'd-' + times[0],
                'd-' + times[2],
                'c-' + times[6]
            ],
            ob = {};
        for (var i = 0; i < ks.length; i++) {
            ob[ks[i]] = null;
        }
        expect(Intr._getConstructionMap(ob)).to.eql([
            [times[0], true],
            [times[2], true],
            [times[5], true],
            [times[6], false]
        ]);
    });
});

describe('interpreter', function() {
    it('can add remove add add remove remove and grid does whats expected', function() {
        var intr = new Intr();
        intr.push('c-' + times[0], {
            headers: { path: '/' },
            method: 'GET',
            body: 'a=1&b=2',
            target: 'web'
        });
        expect(intr.get()).to.eql([
            {
                "Connect Time": Intr.decode(times[0]).toISOString(),
                "Response Time": null,
                "Request Length": null,
                "Request Headers": { path: "/" },
                "Method": "GET",
                "Request Body": 'a=1&b=2',
                "Target": 'web',
                "Status": "On Going"
            }
        ]);
                // "Response Time": times[1].toISOString(),
                // "Request Length": 1000,
    });
});

