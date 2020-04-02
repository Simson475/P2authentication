const http = require('http');
const fs = require('fs');


http.createServer(async function(req, res) {
    console.log(" request was made: " + req.url + " with method " + req.method);
    switch (req.url) {
        case "/validate":
            validator(req, res);
            break;

        default:
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404, Site not found");
            break;
    }

}).listen(3000, "127.0.0.1");
console.log("listening at 3000");


/**
 * validates the user has an account with given username/password combo. if so. sends data back if not, sends error back
 * @param {object} req req is users request sent to the server. includes username and password etc.
 * @param {object} res res is response sent to user. used to send info back.
 */
async function validator(req, res) {
    res.writeHead(201, { "Content-Type": "application/json" })
    let data = ""
    let userData = null
    await req.on("error", (err) => console.error(err))
        .on("data", (chunk) => data += chunk)
    data = JSON.parse(data)
    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json"));
    for (element of database) {
        if (data.username == element.username && data.password == element.hashValue) {
            userData = JSON.parse(fs.readFileSync(__dirname + "/" + data.username + ".json"));
        }
    }

    console.log(userData);
    res.end(JSON.stringify(userData));
}