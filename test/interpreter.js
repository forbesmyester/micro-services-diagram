"use strict";

var expect = require('expect.js'),
    Intr = require('../interpreter.js');

var sample1 = {
    person: { name: null },
    order: { owner: { link: "person" } },
    a: { letter: { link: "person.name" } },
    b: { something: null }
};


var times = [];

for (var i = 0; i < 100; i++) {
    times.push(new Date(2014, 2, 2, 2, 2, i));
}

describe('interpreter', function() {
    it('can add remove add add remove remove and grid does whats expected', function() {
        var intr = new Intr();
        intr.push(times[0], {
            headers: { path: '/' },
            method: 'GET',
            body: 'a=1&b=2',
            target: 'web'
        });
        expect(intr.get()).to.eql([
            {
                "Connect Time": times[0].toISOString(),
                "Response Time": times[1].toISOString(),
                "Request Length": 1000,
                "Request Headers": '{"path":"/"}',
                "Method": "GET",
                "Request Body": 'a=1&b=2',
                "Target": 'web',
                "Status": "On Going"
            }
        ]);
    });
});

