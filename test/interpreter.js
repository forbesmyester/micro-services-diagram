"use strict";

var expect = require('expect.js'),
    Intr = require('../interpreter.js');


var times = [];

var baseDate = new Date(2014, 2, 2, 2, 2, 2, 2).getTime();
for (var i = 0; i < 100; i++) {
    times.push(Intr.encode(baseDate + (i * 1000)));
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
        var t = new Date(2014,2,2,2,2,2,2).getTime();
        var intr = new Intr();
        intr.push('c-' + times[0], {
            headers: { path: '/person/123' },
            method: 'GET',
            target: 'acl'
        });
        intr.push('c-' + times[1], {
            headers: { path: '/' },
            method: 'POST',
            body: 'a=1&b=2',
            target: 'web'
        });
        expect(intr.getRows()).to.eql([
            {
                "Connect Time": new Date(Intr.decode(times[0])).toISOString(),
                "Response Time": null,
                "Request Headers": { path: "/person/123" },
                "Method": "GET",
                "Request Body": null,
                "Target": 'acl',
                "Status": "On Going"
            },
            {
                "Connect Time": new Date(Intr.decode(times[1])).toISOString(),
                "Response Time": null,
                "Request Headers": { path: "/" },
                "Method": "POST",
                "Request Body": 'a=1&b=2',
                "Target": 'web',
                "Status": "On Going"
            }
        ]);
        intr.push('d-' + times[1], {
            headers: { 'Content-Type': 'application/json' },
            resp: '{"ok":true}',
            time: Intr.decode(times[2])
        });
        expect(intr.getRows()).to.eql([
            {
                "Connect Time": new Date(Intr.decode(times[0])).toISOString(),
                "Response Time": null,
                "Request Headers": { path: "/person/123" },
                "Method": "GET",
                "Request Body": null,
                "Target": 'acl',
                "Status": "On Going"
            },
            {
                "Connect Time": new Date(Intr.decode(times[1])).toISOString(),
                "Response Time": '1000ms',
                "Request Headers": { path: "/" },
                "Method": "POST",
                "Request Body": 'a=1&b=2',
                "Target": 'web',
                "Status": "Complete",
                "Response Headers": { "Content-Type": "application/json" },
                "Response Body": '{"ok":true}'
            }
        ]);
    });
});

