const fs = require('fs'); //Giver os filfunktioner så vi kan skrive til og læse fra databasen
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require("bcrypt");
const session = require("express-session");
const jwt = require("jsonwebtoken");

const logger = function(req, res, next) {
    console.log(req.method + " request received at " + req.url)
    next()
}

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: false })); //TODO find ud af hvad den gør
app.use(logger);

app.post("/validate", ((req, res) => { login(req, res) })) //Kalder funktionen validator hvis post request på /validate
app.post("/newUser", ((req, res) => { masterAccount(req, res) })) //lytter efter et post request på /newUser og kalder funktionen masterAccount


app.post("/test", verifyToken, (req, res) => { //temporary test
    console.log(req.token);
    jwt.verify(req.token, "secretkey", (err, authData) => { //verifies the authenticity of the token.
        if (err) { //if error responds with authorization denied
            console.log("error occured " + err)
            res.sendStatus(401);
        } else { //if no error responds with success and who logged in.
            res.json({
                message: "success",
                authData
            })
        };
    });
})

app.listen(3000, () => { console.log("listening at 3000") }) //sætter serveren til at lytte på 3000


/**
 * Validates if the users has an account then creates a JWT for the user which can be used to automate the login process for the user for a given time in the future.
 * @param {object} req  req is the request the user sends to the server. This includes the username ad password.
 * @param {object} res  res is the response the server sends to the user. This is used to send info back to the user including his copy of the JWT.
 */
async function login(req, res) { //creates JWT for the user logging in.
    let data = req.body
    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json")); //Indlæser databasen fra filen database.json
    let user = null
    console.log(data)
    for (let element of database) { //Itererer over databasen, bruger for bruger.
        if (data.username == element.username && data.password == element.hashValue) { //Tjekker om username og password genkendes  
            user = element //gemmer genkendt bruger
            break;
        }
    }

    if (user == null) { //hvis brugeren ikke er fundet returner error.
        res.end(JSON.stringify("no user with given credentials")); //Tjekker om brugeren eksisterer
    } else { //laver JWT til brugeren ud fra vores secret key (i dette tilfælde "secretkey")
        jwt.sign({ username: user.username, }, "secretkey", { expiresIn: "1h" }, (err, token) => {
            res.json({
                token
            });
        });
    }
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

function verifyToken(req, res, next) {

    //get the auth header value
    const bearerHeader = req.headers["authorization"];
    //check if bearer is undefined
    if (typeof bearerHeader !== "undefined") {
        //split at the space
        const bearer = bearerHeader.split(" ");
        //get token from array
        const bearerToken = bearer[1];
        //set the token
        req.token = bearerToken;
        //next middleware
        next();
    } else {
        //unauthorized
        console.log("token not present")
        res.sendStatus(401);
    };
};



/**
 *  Reads the privatekey and the certiface used for settings up https
 */
//const options = {
//    key: fs.readFileSync('key.pem'),
//    cert: fs.readFileSync('cert.pem')
//};


///**
// * validates the user has an account with given username/password combo. if so. sends data back if not, sends error back
// * @param {object} req req is users request sent to the server. includes username and password etc.
// * @param {object} res res is response sent to user. used to send info back.
// */
//async function validator(req, res) {
//    res.writeHead(201, { "Content-Type": "application/json" }) //Skriver indholdstype i svaret til brugeren.
//    let storedUserData = null;
//    let data = req.body
//    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json")); //Indlæser databasen fra filen database.json
//    for (let element of database) { //Itererer over databasen, bruger for bruger.
//        if (data.username == element.username && data.password == element.hashValue) { //Tjekker om username og password genkendes  
//            storedUserData = JSON.parse(fs.readFileSync(__dirname + "/json/" + data.username + ".json")); //Hvis parret genkendes, indlæses brugerens personlige password-database.
//            break;
//        }
//    }
//
//    if (storedUserData == null) {
//        res.end(JSON.stringify("no user with given credentials")); //Tjekker om brugeren eksisterer
//        return;
//    }
//
//    let domainArray = data.domain.split("/"); //Gemmer websitet uden "http(s)://"
//    let domainStripped = domainArray[2]; //gemmer delen af domænet der ikke indeholder http(s).
//    for (let element of storedUserData) { //Itererer over brugerens gemte domæner.
//        if (domainStripped == element.domain) { //Tjekker om domænet eksisterer i databasen.
//            res.end(JSON.stringify(element)); //Sender domænet, brugernavn og password tilbage.
//            return;
//        }
//    }
//
//    res.end(JSON.stringify("no userdata found for current site")); //Ender her hvis domænet ikke er gemt i den personlige database.
//}