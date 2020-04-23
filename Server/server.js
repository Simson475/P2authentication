require("dotenv").config();
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql");
const util = require('util');
//TODO implement secret in env
const secretKey = "secretkey";
const saltRounds = 10;
const port = 3180;


/**
 * Promisify wrapper
 * TODO
 * @param {Object} login 
 */
function makeDb(login) {
    const connection = mysql.createConnection(login);
    return {
        query(sql, args) {
            return util.promisify(connection.query)
                .call(connection, sql, args);
        },
        close() {
            return util.promisify(connection.end).call(connection);
        }
    };
}

const local = {
    host: "localhost",
    user: "root",
    password: "Password1234",
    database: "PWMAN"
}

const online = {
    host: "localhost",
    user: "sw2b2-23@student.aau.dk",
    password: "ss5fNRfsdNXSaryL",
    database: "sw2b2_23"
}

const db = makeDb(online);

/**
 * Middleware
 * TODO
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
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
    let data = req.body
    let user = await findUserDB(data)
        // user.length == 1 when the user we're looking for exist
    if (user.length == 1 && await bcrypt.compare(data.password.toString(), user[0].hashValue)) {
        jwt.sign({ username: req.body.username, }, secretKey, { expiresIn: "1h" }, (err, token) => {
            if (err) {
                //TODO:some kind of error handling
            } else {
                res.json({ token });
            }
        });
    } else {
        //TODO change to res.send OBS HAS TO CHANGE IN index.js TOO
        res.json("no user with given credentials")
    }
}

/**
 * Creates an account for a user in the Password Manager
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user.
 */
async function masterAccount(req, res) {
    let data = req.body
    let user = await findUserDB(data) //checks if user exists in out mySQL database
    if (user.length > 0) { //if the user exists the length is > 0 send false to client(user is not created)
        res.send(false)
    } else {
        //TODO DET ER HER VI ER IGANG MED REGEX
        bcrypt.hash(data.password.toString(), saltRounds)
            .then(async function(hash) {
                // Store hash in your password DB.

                console.log(mysql.escape(data.username))
                    //TODO sanitize input from user with mySQL.escape (second query is causing trouble with it)
                await db.query("INSERT INTO loginTable SET ?", { username: mysql.escape(data.username), hashValue: hash }) //mysql.escape is used to escape when we accept user input, so they can't give the server input.
                currentUser = await findUserDB(data)
                await db.query("CREATE TABLE user" + currentUser[0].id + "( domain VARCHAR(255), username VARCHAR(255),password VARCHAR(255), PRIMARY KEY(domain))")
                    //console.log("user saved in DB " + data.username)
                res.send(true)

            });
    }
}


/**
 * TODO
 * @param {Object} data 
 */
async function findUserDB(data) {
    let sql = "SELECT * FROM loginTable WHERE username= \"" + mysql.escape(data.username) + "\""
    let result = await db.query(sql)
    return result
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
async function getPassword(req, res) {

    let data = req.body
    jwt.verify(req.token, secretKey, async(err, authData) => { //verifies the authenticity of the token.

        let user = await findUserDB(authData);
        if (err) { //if error responds with authorization denied
            console.log("error occured " + err)
            res.sendStatus(401); //status 401 stands for unauthotized
        } else if (data.domain == undefined) {
            //error handling here
            res.send("domain error")
            console.log("error in domain")
        } else if (user.length == 1) {
            let domainArray = req.body.domain.split("/"); //Gemmer websitet uden "http(s)://"
            let domainStripped = domainArray[2]; //gemmer delen af domænet der ikke indeholder http(s).
            let sql = "SELECT * FROM user" + user[0].id + " WHERE domain= \"" + mysql.escape(domainStripped) + "\""
            let result = await db.query(sql)
            if (result[0] != undefined && result.length == 1) {
                //TODO check if there is data for domain, if not do error handling
                res.json(result[0]) //returns username and password
            } else {
                console.log("test")
                res.json({ error: "no login data for domain" })
            }
        } else {
            res.send("error getting info from DB")
            console.log("error getting info from DB in get password")
        }
    });
};

/**
 * takes information about a new username, password on a new domain and writes it to the users Json file 
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. this either sends a 401, errormessages, false or true. responds true if everything went well
 */
async function addUserInfo(req, res) { //TODO check if user already has account for that domain then send error
    let data = req.body
    jwt.verify(req.token, secretKey, async(err, authData) => { //verifies the authenticity of the token.
        if (err) { // gives unauthorized error  
            res.sendStatus(401); // unauthorized 
            console.log("error in addUserInfo. token not verified")
        } else if (data.domain === undefined || data.username === undefined || data.password === undefined) { //checks if we received all data

            //TODO this is only to show us errors in development. should be simpler error message in finished product.
            res.end("data not received succesfully. we received domain:" + data.domain + " and username: " + data.username + " and password im not showing") // respond error 
            console.log("data not received succesfully. we received domain:" + data.domain + " and username: " + data.username + " and password: " + data.password)

        } else { // we recieved everything
            //TODO error handling in case domain isnt in the right format (missing www, not with https etc.)
            //splices domain so only primary domain remains
            let domainArray = req.body.domain.split("/"); //Gemmer websitet uden "http(s)://"
            let domainStripped = domainArray[2]; //gemmer delen af domænet der ikke indeholder http(s).

            //Checks the database to see if the user already has stored login-data for the website
            let user = await findUserDB(authData)
            console.log(user)
            if (user.length == 1) {
                let sql = "SELECT * FROM user" + user[0].id + " WHERE domain= \"" + mysql.escape(domainStripped) + "\""
                let result = await db.query(sql)
                console.log(result)
                console.log(result.length)
                    //todo change to send or make it as error message. needs to be implemented in client side too.
                if (result.length == 1) res.json("userdata for domain already submitted")
                else { //If the username doesn't exist in the database the new input is added.

                    //mysql.escape is used to escape when we accept user input, so they can't give the server input. 
                    let parameter = { domain: mysql.escape(domainStripped), username: mysql.escape(data.username), password: mysql.escape(data.password) }
                    db.query("INSERT INTO user" + user[0].id + " SET ?", parameter)
                        .then(
                            //TODO error handling
                            res.send(true)
                        )
                }
            } else {
                console.log("user length is not 1 it is " + user.length)
                res.send(false)
            }

        }
    })
}