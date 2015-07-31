var React = require('react'),
    Griddle = require('griddle-react');

var data = [
    { a: 1, b: 2 },
    { a: 3, b: 4 },
    { a: 5, b: 6 }
];

setTimeout(function() {
    data[1].a = 9;
    render();
},1000);

function render() {
React.render(<Griddle results={data} />, document.getElementById('root'));
}

render();

