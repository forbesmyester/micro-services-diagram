var http = require('http'),
    httpProxy = require('http-proxy'),
    getTLIdEncoderDecoder = require("get_tlid_encoder_decoder"),
    JsonParser = require('parted').json;


var tLIdEncoderDecoder = getTLIdEncoderDecoder(new Date(2015, 06, 29).getTime(), 5);


var proxy = httpProxy.createProxyServer({});

var getTargetServer = function(req, next) {
    console.log("Q: ", { __tlid: req.__tlid, headers: req.headers, body: req.body });
    next('http://127.0.0.1:8000');
}

var server = http.createServer(function(req, res) {

    req.__tlid = tLIdEncoderDecoder.encode();
    JsonParser.handle(req, res, function() {
        getTargetServer(req, function(target) {
            proxy.web(req, res, { target: target });
        })
    }, {});

});

proxy.on('proxyReq', function(proxyRes, req, res) {
    console.log("P: ", req.__tlid);
});

console.log("listening on port 5050")
server.listen(5050);
