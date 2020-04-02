const http = require('http'); //Giver os de nødvendige objekter 'req' og 'res' samt alt create server relateret
const fs = require('fs'); //Giver os filfunktioner så vi kan skrive til og læse fra databasen


http.createServer(async function(req, res) {
    console.log(" request was made: " + req.url + " with method " + req.method);
    switch (req.url) {
        case "/validate":
            validator(req, res); //funktionskald af validator hvis url'en ender i /validate
            break;
        case "/newUser":
            masterAccount(req, res); //funktionskald der opretter bruger til password manageren
            break;
        case "/addAccount": //TODO tilføj funktion når html fil er klar.
            res.writeHead(404, { "Content-Type": "text/plain" }); //Fejlmelding når URL'en ikke er genkendt
            res.end("404, Site not found");
            break;
        default:
            res.writeHead(404, { "Content-Type": "text/plain" }); //Fejlmelding når URL'en ikke er genkendt
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

    let userData = null;
    let data = await loadData(req);
    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json"));
    for (let element of database) {
        if (data.username == element.username && data.password == element.hashValue) {
            userData = JSON.parse(fs.readFileSync(__dirname + "/" + data.username + ".json"));
        }
    }

    console.log(userData);
    res.end(JSON.stringify(userData));
}
/**
 * Creates an account for a user in the Password Manager
 * @param {object} req 
 * @param {object} res 
 */
async function masterAccount(req, res) {
    res.writeHead(201, { "Content-type": "application/json" }) //TODO FIND UD AF FORMAT DER SENDES OG RET CONTENT TYPE Skriver header på res. til brugeren 
    let data = await loadData(req); //Vi loader Fatimas funktion. loader dataen, skal ventes på.
    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json"));

    for (let element of database) { //Denne iterative kontrolstruktur tjekker om brugernavnet er taget.
        if (data.username == element.username) {
            res.end(JSON.stringify(false)); //TODO indsæt token til 'Unavailable username'
            return; //Hvis username er taget er der ingen grund til at iterere videre   
        }
    }

    database.push({ username: data.username, hashValue: data.password }); //Vi pusher hele elementet til slutningen af array i database.
    fs.writeFile("database.json", JSON.stringify(database, null, 2), function(err, data) { //TODO fund ud af format for error handling her og lav en if statement
        /* STUB */
    });

    fs.writeFile("./json/" + data.username + ".json", JSON.stringify(new Array(0), null, 2),
        function(err, data) { //TODO fund ud af format for error handling her og lav en if statement //Opretter en dedikeret fil der skal indeholde fremtidige sites med passwords.
            res.end(JSON.stringify(true));
        });
}

/**
 * Loads data in bits and returns parsed to JSON.
 * @param {object} req 
 */
async function loadData(req) {
    let data = "";
    await req.on("error", (err) => console.error(err)) //Denne funktion håndterer fejl og logge dem til konsollen
        .on("data", (chunk) => data += chunk); //Når request modtager data skal den concatenate databrudstykkerne til ét stykke
    data = JSON.parse(data); //Denne skal fortolke data til noget forståeligt JSON information.
    return data;
}