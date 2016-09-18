var http = require('http'),
    httpProxy = require('http-proxy'),
    getTLIdEncoderDecoder = require("get_tlid_encoder_decoder"),
    JsonParser = require('parted').json,
    bodyParser = require('body-parser'),
    events = require('events'),
    finalhandler = require('finalhandler'),
    serveStatic = require('serve-static');


var tLIdEncoderDecoder = getTLIdEncoderDecoder(require('./config.js').baseDate, 5);

var proxyEvent = new events.EventEmitter();

var proxy = httpProxy.createProxyServer({});

function getWriteSseData(id, data) {
    return ['id: ' + id, 'data: ' + JSON.stringify(data)].join("\n") + "\n\n";
}

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
        next('http://127.0.0.1:7999');
    }, 100);
}

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
            data: { time: new Date().getTime(), resp: data.toString(), headers: res._headers }
        });
        if( data && data.toString ) {
            myEnd.call( res, data.toString() );
        } else {
            myEnd.apply( res, arguments );
        }
    };

});

// The proxy server
http.createServer(function(req, res) {

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

}).listen(5050);


// The monitor
var serve = serveStatic('public', {'index': ['index.html']})
http.createServer(function(req, res, next) {

    if (req.url == '/evt') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        res.write(getWriteSseData('initial', []));

        function eConnect(data) {
            res.write(getWriteSseData('c-' + data.tlid, data.data));
        }

        function eDisconnect(data) {
            res.write(getWriteSseData('d-' + data.tlid, data.data));
        }

        proxyEvent.on('connect', eConnect);
        proxyEvent.on('disconnect', eDisconnect);

        req.on('end', function() {
            proxyEvent.removeListener('connect', eConnect)
            proxyEvent.removeListener('disconnect', eDisconnect)
        });

        return;
    }

    var done = finalhandler(req, res);
    serve(req, res, done);

}).listen(5051);


