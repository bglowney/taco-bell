var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    sprintf = require('sprintf-js').sprintf,
    moment = require('moment');

var port = 8000;

console.log(sprintf("Starting http server on port %d from %s", port, __dirname));

http.createServer(function (req, res) {

    var method = req.method;
    var urlParts = url.parse(req.url, true);
    var path = urlParts.pathname;
    var params = urlParts.query;
    var statusCode = 200;

    try {
        if (path && path.endsWith(".js")) {
            var fileName = path.substring(1);
            handleFileRequest(fileName, "text/javascript");
        } else {

            var pathMethod = path + ":" + method.toUpperCase();

            switch (pathMethod) {
                case ":GET":
                case "/:GET":
                case "/index:GET":
                case "/index.html:GET":
                    handleFileRequest("./index.html", 'text/html');
                    break;
                case "/remote:GET":
                    if (params.a === "a" && params.b === "b") {
                        var serialized = JSON.stringify({c: 'C', d: true});
                        res.writeHead(statusCode, {
                            "Content-Type": "application/json",
                            'Content-Length': serialized.length
                        });
                        res.write(serialized);
                        res.end();
                    } else {
                        handleUnrecognizedRequest(res);
                    }
                    break;
                case "/remote:POST":
                    res.statusCode = statusCode;
                    res.end();
                    break;
                default:
                    handleUnrecognizedRequest(res);
                    break;
            }
        }
        log(statusCode);
    } catch (e) {
        res.statusCode = 500;
        res.write(writeErrorResponse("Internal failure"));
        res.end();
        log(statusCode, e);
    }

    function handleUnrecognizedRequest(res) {
        statusCode = 400;
        res.statusCode = statusCode;
        res.write(writeErrorResponse("Unrecognized request"));
        res.end();
    }

    function handleFileRequest(fileName, fileType) {
        fs.readFile(fileName, function (err, data) {
            if (err != null) {
                statusCode = 500;
                res.statusCode = statusCode;
            } else {
                res.writeHead(statusCode, {'Content-Type': fileType, 'Content-Length': data.length});
                res.write(data);
                res.end();
            }
            log(statusCode);
        });
    }

    function writeErrorResponse(message) {
        return JSON.stringify({ success: false, message: message });
    }

    function log(statusCode, e) {
        if (!e)
            e = "";
        else
            e = "\n" + e.toString();

        console.log(sprintf("%s %d %s %s %s", moment().format(), statusCode, method, path, e));
    }

}).listen(port);