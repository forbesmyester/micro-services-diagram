var React = require('react'),
    Griddle = require('griddle-react'),
    Intr = require('./../interpreter.js');
    // diayaml = require('db-diayaml');

var intr = new Intr();

var evtSource = new EventSource("/evt");

evtSource.onmessage = function(evt) {
    var data;
    if (evt.lastEventId === 'initial') { return; }
    try {
        data = JSON.parse(evt.data);
        intr.push(evt.lastEventId, data);
        renderTable(intr.getRows());
        // renderGraph(intr.getGraph());
    } catch (e) {
        console.log(e);
    }
}

// function renderGraph(data) {
// lib.getDotSrc(lib.transform(json))
// }

function renderTable(data) {

    React.render(
        React.createElement(
            Griddle,
            {
                results: data,
                columns: Intr.getColumns()
            }
        ),
        document.getElementById('root-griddle')
    );
}

renderTable([]);

