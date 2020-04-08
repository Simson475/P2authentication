const fs = require('fs'); //Giver os filfunktioner så vi kan skrive til og læse fra databasen
require("dotenv").config()
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
    //const methodOverride = require("method-override")
const path = require("path");


/**
 *  Reads the privatekey and the certiface used for settings up https
 */
//const options = {
//    key: fs.readFileSync('key.pem'),
//    cert: fs.readFileSync('cert.pem')
//};
const logger = function(req, res, next) {
    console.log(req.method + " request received at " + req.url)
    next()
}

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })); //TODO find ud af hvad den gør
app.use(logger);

app.post("/validate", ((req, res) => { validator(req, res) })) //Kalder funktionen validator hvis post request på /validate
app.post("/newUser", ((req, res) => { masterAccount(req, res) })) //lytter efter et post request på /newUser og kalder funktionen masterAccount


app.listen(3000, () => { console.log("listening at 3000") }) //sætter serveren til at lytte på 3000

/**
 * validates the user has an account with given username/password combo. if so. sends data back if not, sends error back
 * @param {object} req req is users request sent to the server. includes username and password etc.
 * @param {object} res res is response sent to user. used to send info back.
 */
async function validator(req, res) {
    res.writeHead(201, { "Content-Type": "application/json" }) //Skriver indholdstype i svaret til brugeren.
    let storedUserData = null;
    let data = req.body
    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json")); //Indlæser databasen fra filen database.json
    for (let element of database) { //Itererer over databasen, bruger for bruger.
        if (data.username == element.username && data.password == element.hashValue) { //Tjekker om username og password genkendes  
            storedUserData = JSON.parse(fs.readFileSync(__dirname + "/json/" + data.username + ".json")); //Hvis parret genkendes, indlæses brugerens personlige password-database.
        }
    }
    if (storedUserData == null) {
        res.end(JSON.stringify("no user with given credentials")); //Tjekker om brugeren eksisterer
        return;
    }

    let domainArray = data.domain.split("/"); //Gemmer websitet uden "http(s)://"
    let domainStripped = domainArray[2]; //gemmer delen af domænet der ikke indeholder http(s).
    for (let element of storedUserData) { //Itererer over brugerens gemte domæner.
        if (domainStripped == element.domain) { //Tjekker om domænet eksisterer i databasen.
            res.end(JSON.stringify(element)); //Sender domænet, brugernavn og password tilbage.
            return;
        }
    }

    res.end(JSON.stringify("no userdata found for current site")); //Ender her hvis domænet ikke er gemt i den personlige database.
}

/**
 * Creates an account for a user in the Password Manager
 * @param {object} req 
 * @param {object} res 
 */
async function masterAccount(req, res) {
    res.writeHead(201, { "Content-type": "application/json" }) //TODO FIND UD AF FORMAT DER SENDES OG RET CONTENT TYPE Skriver header på res. til brugeren 
    let data = req.body
    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json")); //Indlæser databasen fra filen database.json

    for (let element of database) { //Denne iterative kontrolstruktur tjekker om brugernavnet er taget.
        if (data.username == element.username) {
            res.end(JSON.stringify(false)); //TODO indsæt token til 'Unavailable username'
            return; //Hvis username er taget er der ingen grund til at iterere videre   
        }
    }

    database.push({ username: data.username, hashValue: data.password }); //Vi pusher hele elementet til slutningen af array i database.
    fs.writeFile(__dirname + "/database.json", JSON.stringify(database, null, 2), function(err, data) { //TODO fund ud af format for error handling her og lav en if statement
        /* STUB */
    });

    fs.writeFile(__dirname + "/json/" + data.username + ".json", JSON.stringify(new Array(0), null, 2),
        function(err, data) { //TODO fund ud af format for error handling her og lav en if statement //Opretter en dedikeret fil der skal indeholde fremtidige sites med passwords.
            res.end(JSON.stringify(true));
        });

}