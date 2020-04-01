const http = require('http');
const fs = require('fs');


http.createServer(async function(req, res) {
    console.log(" request was made: " + req.url + " with method " + req.method);
    switch (req.url) {
        case "/validate":
            res.writeHead(201, { "Content-Type": "application/json" })
            req.on("data", function(chunk) {
                console.log(JSON.parse(chunk))
            });
            res.end()
            break;

        default:
            res.writeHead(404, { "Content-Type": "text/plain" })
            res.end("404, Site not found")
            break;
    }

}).listen(3000, "127.0.0.1")
console.log("listening at 3000")