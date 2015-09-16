var http = require("http");

var superagent = require('superagent');
superagent.get("http://www.weather.com.cn/adat/sk/101020900.html")
    .end(function (err, respnse) {
        content = JSON.parse(respnse.text);
        console.log(content);
    });
var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<head><meta charset="utf-8"/></head>');
    res.write('<h1>Node.js测试</h1>');
    res.write(JSON.stringify(content.weatherinfo));
    res.end();
});
server.listen(1337, "localhost", function () {
    console.log("开始监听...");
});

