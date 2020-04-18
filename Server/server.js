const fs = require('fs'); //Giver os filfunktioner så vi kan skrive til og læse fra databasen
require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//TODO implement secret in env
const secretKey = "secretkey"
const saltRounds = 10
const port = 3000

const logger = function(req, res, next) {
    console.log(req.method + " request received at " + req.url)
    next()
}

app.use(express.json()) // for parsing application/json
app.use(logger);

app.post("/validate", (async(req, res) => { login(req, res) })); //Kalder funktionen validator hvis post request på /validate
app.post("/newUser", (async(req, res) => { masterAccount(req, res) })); //lytter efter et post request på /newUser og kalder funktionen masterAccount
app.post("/getPassword", verifyToken, async(req, res) => { getPassword(req, res) });
app.post("/updateInfo", verifyToken, async(req, res) => { addUserInfo(req, res) });

app.listen(port, () => { console.log("listening at " + port) }) //sætter serveren til at lytte på 3000


/**
 * Validates if the users has an account then creates a JWT for the user which can be used to automate the login process for the user for a given time in the future.
 * @param {object} req  req is the request the user sends to the server. This includes the username ad password.
 * @param {object} res  res is the response the server sends to the user. This is used to send info back to the user including his copy of the JWT.
 */
async function login(req, res) { //creates JWT for the user logging in.
    let user = await findUser(req.body)
    if (user == false) { //hvis brugeren ikke er fundet returner error.
        res.end(JSON.stringify("no user with given credentials")); //Tjekker om brugeren eksisterer
    } else { //laver JWT til brugeren ud fra vores secret key (i dette tilfælde "secretkey")
        jwt.sign({ username: req.body.username, }, secretKey, { expiresIn: "1h" }, (err, token) => {
            if (err) {
                //TODO:some kind of error handling
            } else {
                res.json({ token });
            }
        });
    }
}

/**
 * checks our database for a user with current username and database. if found returns true, if not returns false
 * @param {Object} user the user we want to validate is in our database
 */
async function findUser(user) {
    //TODO chance all readFileSync to readFile. THIS IS NOT JUST REMOVING SYNC
    let database = await JSON.parse(fs.readFileSync(__dirname + "/database.json")); //Indlæser databasen fra filen database.json
    let found = database.find(element => { return element.username == user.username })

    if (typeof found == "object" && bcrypt.compare(user.password.toString(), found.hashValue)) return true
    else return false
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
            function(err, data) {
                //TODO find ud af format for error handling her og lav en if statement //Opretter en dedikeret fil der skal indeholde fremtidige sites med passwords.
                if (err) {

                } else {
                    res.end(JSON.stringify(true));
                }
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
 * takes information about a new username, password on a new domain and writes it to the users Json file 
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. this either sends a 401, errormessages, false or true. responds true if everything went well
 */
function addUserInfo(req, res) { //TODO check if user already has account for that domain then send error
    let data = req.body
    jwt.verify(req.token, secretKey, (err, authData) => { //verifies the authenticity of the token.
        if (err) { // gives unauthorized error  
            res.sendStatus(401); // unauthorized 
            console.log("error in addUserInfo. token not verified")
        } else {
            let storedUserData = JSON.parse(fs.readFileSync(__dirname + "/json/" + authData.username + ".json")); //indlæser brugerens personlige password-database.
            if (data.domain === undefined || data.username === undefined || data.password === undefined) { //checks if we received all data

                //TODO this is only to show us errors in development. should be simpler error message in finished product.
                res.end("data not received succesfully. we received domain:" + data.domain + " and username: " + data.username + " and password im not showing") // respond error 
                console.log("data not received succesfully. we received domain:" + data.domain + " and username: " + data.username + " and password: " + data.password)
            } else { // we recieved everything
                //TODO error handling in case domain isnt in the right format (missing www, not with https etc.)

                //splices domain so only primary domain remains
                let domainArray = req.body.domain.split("/"); //Gemmer websitet uden "http(s)://"
                let domainStripped = domainArray[2]; //gemmer delen af domænet der ikke indeholder http(s).

                storedUserData.push({ //get the new information pushed to the object 
                    domain: domainStripped,
                    username: data.username,
                    password: data.password
                });
                fs.writeFile(__dirname + "/json/" + authData.username + ".json", JSON.stringify(storedUserData, null, 2), // writes the changes to the Json file for the username 
                    function(err, data) {
                        if (err) {
                            //TODO Error handling goes here 
                            console.log("error 2 in addUserInfo")
                            res.end(JSON.stringify(false)) //respond false
                        } else {
                            res.end(JSON.stringify(true)); // respond true we did not encounter any errors so everything went fine
                        }
                    });
            }
        }
    })
}