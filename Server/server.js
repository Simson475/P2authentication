require("dotenv").config();
const express = require("express"); //server framework
const app = express(); //saves part of the framework as app
const bcrypt = require("bcrypt"); //allows encryption using hashes and comparisons with password
const jwt = require("jsonwebtoken"); // allows jsonwebtoken authorization
const mysql = require("mysql"); //allows communication with database (mysql)
const util = require('util'); //used for promisify wrapper of mysql queries
//TODO implement secret in env
const secretKey = "secretkey"; //the key used when signing JSon
const saltRounds = 10; //amount of rounds brypt uses
const port = 3180; //port server is hosted on'


/**
 * Promisify wrapper lets us use db as promises instead of with callback functions. 
 * @param {Object} login information needed to login to the server. should as a minimum include host user and password.
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

const local = { //local development server on simon PC
    host: "localhost",
    user: "root",
    password: "Password1234",
    database: "PWMAN"
}

const online = { //mysql server hosted on university server. 
    host: "localhost",
    user: "sw2b2-23@student.aau.dk",
    password: "ss5fNRfsdNXSaryL",
    database: "sw2b2_23"
}

const db = makeDb(online); //makes the database connection. and allows us to make queries to the database chosen.

/**
 * Middleware
 * console.logs the request method used and the request url send.
 * @param {Object} req is the request the user send to server. This include the username and password
 * @param {Object} res is the response the server sends to the user. This is used to send info back to the user. 
 * @param {Function} next Calls the next function
 */
const logger = function(req, res, next) {
    console.log(req.method + " request received at " + req.url)
    next()
}

app.use(express.json()) // for parsing application/json
app.use(logger); //console logs requests

app.post("/validate", (async(req, res) => { login(req, res) })); //when post request happens to /validate, run login function
app.post("/newUser", (async(req, res) => { masterAccount(req, res) })); //when post request happens to /newUser, run masterAccount function
app.post("/getPassword", verifyToken, async(req, res) => { getPassword(req, res) }); //when post request happens to /getPassword, run verifyToken and then getPassword function
app.post("/updateInfo", verifyToken, async(req, res) => { addUserInfo(req, res) }); //when post request happens to /updateInfo, run verifyToken and then addUserInfo function

app.listen(port, () => { console.log("listening at " + port) }) //Sets the server to listen to port 3180


/**
 * Validates if the users has an account then creates a JWT for the user which can be used to automate the login process for the user for a given time in the future.
 * @param {object} req  req is the request the user sends to the server. This includes the username and password.
 * @param {object} res  res is the response the server sends to the user. This is used to send info back to the user including his copy of the JWT.
 */
async function login(req, res) { //creates JWT for the user logging in.
    try {
        let data = req.body
        let user = await findUserDB(data) //Waits for the findUserDB function to return an answer

        if (user.length == 1 && await bcrypt.compare(data.password.toString(), user[0].hashValue)) { //Waits for the bcrypt hashing to be finished.
            jwt.sign({ username: req.body.username, }, secretKey, { expiresIn: "1h" }, (err, token) => { //Creates a JasonWebToken for the user and sets the expire time to 1 hour.
                try {
                    if (err) throw err //if JWT is not signed, throw err
                    else res.json({ token }); //send the signed token to client

                } catch (err) {
                    errorHandling(err, res)
                }
            });

        } else {
            throw "no user with given credentials" //if username or password is not corrent throw error
        }
    } catch (err) {
        errorHandling(err, res)
    }
}


/**
 * Creates an account for a user in the Password Manager
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user.
 */
async function masterAccount(req, res) { //Checks for if an account already excist, if the name is free the account is created and stored on the database.
    try {
        let data = req.body
        let user = await findUserDB(data) //checks if user exists in out mySQL database

        //if the user exists the length is > 0 send false to client(user is not created)
        if (user.length > 0) throw "username already in use" //if a user is found with current username throw error

        else {
            bcrypt.hash(data.password.toString(), saltRounds).then(async function(hash) { //after password is hashed calls the funtion with the hashed password stored in hash
                await db.query("INSERT INTO loginTable SET ?", { username: mysql.escape(data.username), hashValue: hash }) //mysql.escape is used to escape when we accept user input, so they can't give the server input.
                currentUser = await findUserDB(data) //finds the ID for the user
                await db.query("CREATE TABLE user" + currentUser[0].id + "( domain VARCHAR(255), username VARCHAR(255),password VARCHAR(255), PRIMARY KEY(domain))") //Creates a table for the user in the loginTable
                res.send(true)
            });
        }
    } catch (err) {
        errorHandling(err, res)
    }
}


/**
 * Sends a query to MySQL database and return the user with given username 
 * @param {Object} data data should have a property.username that has the current users username.
 */
async function findUserDB(data) { //looks up a given user in the database tables.
    let sql = "SELECT * FROM loginTable WHERE username= \"" + mysql.escape(data.username) + "\"" // Select a table from the table loginTable with the username data.username
    let result = await db.query(sql) //sends query to DB
    return result //returns all the stored data for the user
}


/**
 * Middleware that verifies an authorization token is received. it is the saved in req.token for future functions to user
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. only used if token is not present.
 * @param {Object} next calls the next function (middleware or other function)
 */
function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"]; //get the auth header value

    //error handling
    if (typeof bearerHeader == "undefined") res.sendStatus(401); //status 401 stands for unauthorized} { //check if bearer is undefined

    //if no errors recieved
    else {
        const bearer = bearerHeader.split(" "); //split at the space
        const bearerToken = bearer[1]; //get token from array
        req.token = bearerToken; //set the token
        next(); //next middleware
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
        try {
            let user = await findUserDB(authData); //stores the collected userdata in user
            let domainStripped = req.body.domain.split("/")[2]; //gemmer delen af domænet der ikke indeholder http(s).
            let sql = "SELECT * FROM user" + user[0].id + " WHERE domain= \"" + mysql.escape(domainStripped) + "\"" //looks up the Domain under the userID to see if there is stored info for the website.
            let userData = (await db.query(sql))[0] //stores the table data in position 0 as userdata.

            //error handling
            if (err) res.sendStatus(401); //status 401 stands for unauthotized
            else if (data.domain == undefined) throw "domain not found"
            else if (user.length != 1) throw "error getting info from DB"
            else if (userData == undefined) throw "no login data for domain"

            //if no errors recieved
            else {
                userData.domain = userData.domain.split("'")[1] //strips ' (the sql protection)
                userData.username = userData.username.split("'")[1] //strips ' (the sql protection)
                userData.password = userData.password.split("'")[1] //strips ' (the sql protection)
                res.json(userData) //returns username and password
            }
        } catch (err) {
            errorHandling(err, res)
        }
    });
};


/**
 * takes information about a new username, password on a new domain and writes it to the users Json file 
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. this either sends a 401, errormessages, false or true. responds true if everything went well
 */
async function addUserInfo(req, res) {
    let data = req.body

    jwt.verify(req.token, secretKey, async(err, authData) => { //verifies the authenticity of the token.
        try {
            let user = await findUserDB(authData) //find current user.
            let domainStripped = req.body.domain.split("/")[2]; //gemmer delen af domænet der ikke indeholder http(s).
            let sql = "SELECT * FROM user" + user[0].id + " WHERE domain= \"" + mysql.escape(domainStripped) + "\"" //finds the table with the userID given and where the domain is domainStripped.
            let result = await db.query(sql) //sends query to server.

            //error handling
            if (err) res.sendStatus(401); //status 401 stands for unauthotized
            else if (data.domain === undefined || data.username === undefined || data.password === undefined) throw "Data was not filled correctly" //if userdata is not received properly of if any is missing throw error
            else if (user.length != 1) throw user.length < 1 ? "no user with given credentials" : "more than one user found contact support" //if no user was found, or more than one was found, throw error.
            else if (result.length == 1) throw "userdata for domain already submitted" //if userdata is found for current domain, throw error

            //if no errors recieved
            else { // we recieved everything
                let parameter = { domain: mysql.escape(domainStripped), username: mysql.escape(data.username), password: mysql.escape(data.password) } //creates object we want to save in DB
                db.query("INSERT INTO user" + user[0].id + " SET ?", parameter) //inserts data into the users personal table
                    .then(res.send(true)) //responds with true if everything goes according to plan
            }
        } catch (err) {
            errorHandling(err, res)
        }
    })

}


/**
 * is called when an error is caugh. responds to client with given error and console logs it.
 * @param {Object} err includes whatever went wrong in the program
 */
async function errorHandling(err, res) { //generalizaed error handling.
    res.json({ error: err }) //respond to client with error message thrown above
    console.log(err) //logs error message from above
}