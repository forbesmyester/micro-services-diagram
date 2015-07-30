var http = require('http'),
    httpProxy = require('http-proxy'),
    getTLIdEncoderDecoder = require("get_tlid_encoder_decoder"),
    JsonParser = require('parted').json,
    bodyParser = require('body-parser'),
    events = require('events');


var tLIdEncoderDecoder = getTLIdEncoderDecoder(new Date(2015, 06, 29).getTime(), 5);

var proxyEvent = new events.EventEmitter();

var proxy = httpProxy.createProxyServer({});

function restreamer(req, next) {
    req.removeAllListeners('data');
    req.removeAllListeners('response');
    req.removeAllListeners('end');
    next();
    process.nextTick(function () {
        if(req.body) {
            req.emit('data', JSON.stringify(req.body))
        }
        delete req.body;
        req.emit('end')
    });
}

var getTargetServer = function(req, next) {
    setTimeout(function() {
    next('http://127.0.0.1:8000');
    }, 100);
}

// Stolen from https://github.com/nodejitsu/node-http-proxy/blob/76051032e7dcea522a691e88ffbc2f8d03f1365c/examples/middleware/bodyDecoder-middleware.js
var server = http.createServer(function(req, res) {

    req.__tlid = tLIdEncoderDecoder.encode();

    var parser = bodyParser.json();

    parser(req, res, function() {
        getTargetServer(req, function(target) {
            proxyEvent.emit("connect", {
                tlid: req.__tlid,
                data: {
                    headers: req.headers,
                    method: req.method,
                    body: req.body,
                    target: target
                }
            });
            restreamer(req, function() {
                proxy.web(req, res, { target: target });
            })
        });

    });

});

function getWriteSseData(id, data) {
    return ['id: ' + id, 'data: ' + JSON.stringify(data)].join("\n") + "\n\n";
}
monitor = http.createServer(function(req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.write(getWriteSseData('initial', []));

    proxyEvent.on('connect', function(data) {
        res.write(getWriteSseData('c-' + data.tlid, data.data));
    });

    proxyEvent.on('disconnect', function(data) {
        res.write(getWriteSseData('d-' + data.tlid, data.data));
    });

});

proxy.on('proxyReq', function(proxyRes, req, res) {

    var myEnd = res.end, data;

    res.write = function( partData ) {
        if( data ) {
            data += partData;
        } else {
            data = partData;
        }
    };

    res.end = function() {
        proxyEvent.emit('disconnect', {
            tlid: req.__tlid,
            data: { resp: data.toString(), headers: res._headers }
        });
        if( data && data.toString ) {
            myEnd.call( res, data.toString() );
        } else {
            myEnd.apply( res, arguments );
        }
    };

});

server.listen(5050);
monitor.listen(5051);
