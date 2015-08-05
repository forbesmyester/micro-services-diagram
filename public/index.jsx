var React = require('react'),
    Griddle = require('griddle-react'),
    Intr = require('./../interpreter.js');

var intr = new Intr();

var evtSource = new EventSource("/evt");
evtSource.onmessage = function(evt) {
    var data;
    if (evt.lastEventId === 'initial') { return; }
    try {
        data = JSON.parse(evt.data);
        intr.push(evt.lastEventId, data);
        render(intr.get());
    } catch (e) {
        console.log(e);
    }

}

function render(data) {
    React.render(
        <Griddle
            results={data}
            columns={Intr.getColumns()}/>,
        document.getElementById('root')
    );
}

render([]);

