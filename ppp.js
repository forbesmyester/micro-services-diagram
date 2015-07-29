var http = require('http'),
    httpProxy = require('http-proxy'),
    getTLIdEncoderDecoder = require("get_tlid_encoder_decoder"),
    JsonParser = require('parted').json,
    bodyParser = require('body-parser');


var tLIdEncoderDecoder = getTLIdEncoderDecoder(new Date(2015, 06, 29).getTime(), 5);


var proxy = httpProxy.createProxyServer({});

var getTargetServer = function(req, next) {
    console.log("getTargetServer: ", {
        __tlid: req.__tlid,
        headers: req.headers,
        method: req.method,
        body: req.body
    });
    setTimeout(function() {
    next('http://127.0.0.1:8000');
    }, 100);
}

// Stolen from https://github.com/nodejitsu/node-http-proxy/blob/76051032e7dcea522a691e88ffbc2f8d03f1365c/examples/middleware/bodyDecoder-middleware.js
var restreamer = function(req, next) { //restreame
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
};

var server = http.createServer(function(req, res) {

    req.__tlid = tLIdEncoderDecoder.encode();

    var parser = bodyParser.json();

    parser(req, res, function() {
        getTargetServer(req, function(target) {
            restreamer(req, function() {
                proxy.web(req, res, { target: target });
            })
        });

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
        console.log("proxyReq: ", {
            __tlid: req.__tlid,
            resp: data.toString()
        });
        if( data && data.toString ) {
            myEnd.call( res, data.toString() );
        } else {
            myEnd.apply( res, arguments );
        }
    };

});

console.log("listening on port 5050")
server.listen(5050);
