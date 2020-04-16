const fs = require('fs'); //Giver os filfunktioner så vi kan skrive til og læse fra databasen
require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secretKey = "secretkey"
const saltRounds = 10
const logger = function(req, res, next) {
    console.log(req.method + " request received at " + req.url)
    next()
}

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: false })); //TODO find ud af hvad den gør
app.use(logger);

app.post("/validate", ((req, res) => { login(req, res) })) //Kalder funktionen validator hvis post request på /validate
app.post("/newUser", ((req, res) => { masterAccount(req, res) })) //lytter efter et post request på /newUser og kalder funktionen masterAccount
app.post("/getPassword", verifyToken, ((req, res) => { getPassword(req, res) }))

app.post("/test", verifyToken, (req, res) => { //temporary test
    console.log(req.token);
    jwt.verify(req.token, secretKey, (err, authData) => { //verifies the authenticity of the token.
        if (err) { //if error responds with authorization denied
            console.log("error occured " + err)
            res.sendStatus(401);
        } else { //if no error responds with success and who logged in.
            res.json({
                message: "success",
                authData
            })
        }
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
    for (let element of database) { //Itererer over databasen, bruger for bruger.
        if (data.username == element.username) { //Tjekker om username og password genkendes  
            const match = await bcrypt.compare(data.password.toString(), element.hashValue);
            if (match) user = element //gemmer genkendt bruger
            break;
        }
    }

    if (user == null) { //hvis brugeren ikke er fundet returner error.
        res.end(JSON.stringify("no user with given credentials")); //Tjekker om brugeren eksisterer
    } else { //laver JWT til brugeren ud fra vores secret key (i dette tilfælde "secretkey")
        jwt.sign({ username: user.username, }, secretKey, { expiresIn: "1h" }, (err, token) => {
            res.json({
                token
            });
        });
    }
}

/**
 * Creates an account for a user in the Password Manager
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user.
 */
async function masterAccount(req, res) {
    res.writeHead(201, { "Content-type": "application/json" }) //TODO FIND UD AF FORMAT DER SENDES OG RET CONTENT TYPE Skriver header på res. til brugeren 
    let data = req.body
    let database = JSON.parse(fs.readFileSync(__dirname + "/database.json")); //Indlæser databasen fra filen database.json
    console.log(data)
    for (let element of database) { //Denne iterative kontrolstruktur tjekker om brugernavnet er taget.
        if (data.username == element.username) {
            res.end(JSON.stringify(false)); //TODO indsæt token til 'Unavailable username'
            return; //Hvis username er taget er der ingen grund til at iterere videre   
        }
    }
    bcrypt.hash(data.password.toString(), saltRounds).then(function(hash) {
        // Store hash in your password DB.
        database.push({ username: data.username, hashValue: hash }); //Vi pusher hele elementet til slutningen af array i database.
        fs.writeFile(__dirname + "/database.json", JSON.stringify(database, null, 2), function(err, data) { //TODO fund ud af format for error handling her og lav en if statement
            /* STUB */
        });
        fs.writeFile(__dirname + "/json/" + data.username + ".json", JSON.stringify(new Array(0), null, 2),
            function(err, data) { //TODO fund ud af format for error handling her og lav en if statement //Opretter en dedikeret fil der skal indeholde fremtidige sites med passwords.
                res.end(JSON.stringify(true));
            });
    });


}
/**
 * Middleware that verifies an authorization token is received. it is the saved in req.token for future functions to user
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. only used if token is not present.
 * @param {Object} next calls the next function (middleware or other function)
 */
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
    }
}

/**
 * verifies token is issued from this server. if it is, it responds with users username and password for the domain
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. this either sends a 401, error handling, or username/password
 */
function getPassword(req, res) {
    let data = req.body
    console.log(data)
    jwt.verify(req.token, secretKey, (err, authData) => { //verifies the authenticity of the token.
        if (err) { //if error responds with authorization denied
            console.log("error occured " + err)
            res.sendStatus(401);
        } else { //if no error responds with success and who logged in.
            //authData.username tilgår brugerens username.
            let storedUserData = JSON.parse(fs.readFileSync(__dirname + "/json/" + authData.username + ".json")); //indlæser brugerens personlige password-database.
            if (req.body.domain == undefined) {
                //error handling here
                res.end(JSON.stringify("domain error"))
                console.log("error in domain")
            } else {
                let domainArray = req.body.domain.split("/"); //Gemmer websitet uden "http(s)://"
                let domainStripped = domainArray[2]; //gemmer delen af domænet der ikke indeholder http(s).
                for (let element of storedUserData) { //Itererer over brugerens gemte domæner.
                    if (domainStripped == element.domain) { //Tjekker om domænet eksisterer i databasen.
                        res.end(JSON.stringify(element)); //Sender domænet, brugernavn og password tilbage.
                        return;
                    };
                };
                res.end(JSON.stringify("No login information for current website"));
            };
        };
    });
};


/**
 *  Reads the privatekey and the certiface used for settings up https
 */
//const options = {
//    key: fs.readFileSync('key.pem'),
//    cert: fs.readFileSync('cert.pem')
//};