require("dotenv").config();
const express = require("express"); // Server framework
const app = express(); // Saves part of the framework as app
const bcrypt = require("bcrypt"); // Allows encryption using hashes and comparisons with password
const jwt = require("jsonwebtoken"); // Allows jsonwebtoken authorization
const { createAccount, findUserDB, deleteUserdataFromDB, stripQuotes, findLoginInfo, insertIntoUserTable } = require("./mysqlUtil.js")
const secretKey = process.env.SESSION_SECRET; // The key used when signing JSon this key is loaded from .env
const saltRounds = process.env.SALT_ROUNDS; // Amount of rounds brypt uses
const port = process.env.PORT; // Port server is hosted on'


/**
 * Middleware
 * console.logs the request method used and the request url send.
 * @param {Object} req is the request the user send to server. This include the username and password
 * @param {Object} res is the response the server sends to the user. This is used to send info back to the user. 
 * @param {Function} next Calls the next function
 */
const logger = function(req, res, next) { //l Lgs user input
    console.log(req.method + " request received at " + req.url);
    next(); // Calls next function
}


// App.use is all middleware run whenever a request for the server is made.
app.use(express.json()); // For parsing application/json
app.use(logger); // Console logs requests

// The post/delete requests sent to the server
app.post("/validate", (async(req, res) => { login(req, res) })); // When post request happens to /validate, run login function
app.post("/newUser", (async(req, res) => { masterAccount(req, res) })); // When post request happens to /newUser, run masterAccount function
app.post("/getPassword", verifyToken, async(req, res) => { getPassword(req, res) }); // When post request happens to /getPassword, run verifyToken and then getPassword function
app.post("/updateInfo", verifyToken, async(req, res) => { addUserInfo(req, res) }); // When post request happens to /updateInfo, run verifyToken and then addUserInfo function
app.post("/confirmUsername", verifyToken, async(req, res) => { confirmUsername(req, res) }); // When post request happens to /confirmUsername, run verifyToken and then confirmUsername
app.delete("/deleteAccount", verifyToken, async(req, res) => { deleteAccount(req, res) }); // When delete request happens to /deleteAccount, run verifyToken and then deleteAccount
app.listen(port, () => { console.log("listening at " + port) }); // Sets the server to listen to port 3180


/**
 * Validates if the users has an account then creates a JWT for the user which can be used to automate the login process for the user for a given time in the future.
 * @param {object} req  req is the request the user sends to the server. This includes the username and password.
 * @param {object} res  res is the response the server sends to the user. This is used to send info back to the user including his copy of the JWT.
 */
async function login(req, res) { // Creates JWT for the user logging in.
    try {
        const data = req.body
        const user = await findUserDB(data); // Waits for the findUserDB function to return an answer

        if (user.length === 1 && await bcrypt.compare(data.password.toString(), user[0].hashValue)) { // Waits for the bcrypt hashing to be finished.

            jwt.sign({ username: data.username, id: user[0].id }, secretKey, { expiresIn: "1h" }, (err, token) => { // Creates a JasonWebToken for the user and sets the expire time to 1 hour.
                try {
                    if (err) throw "error during signing of webtoken"; // If JWT is not signed, throw err
                    else res.json({ token }); // Send the signed token to client

                } catch (err) {
                    errorHandling(err, res);
                }
            });

        } else {
            throw "No user with given credentials"; // If username or password is not corrent throw error
        }
    } catch (err) {
        await errorHandling(err, res);
    }
}


/**
 * Creates an account for a user in the Password Manager
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user.
 */
async function masterAccount(req, res) { // Checks for if an account already excist, if the name is free the account is created and stored on the database.
    try {
        const data = req.body;
        const user = await findUserDB(data); // Checks if user exists in out mySQL database

        // If the user exists the length is > 0 send false to client(user is not created)
        if (user.length > 0) throw "username already in use"; // If a user is found with current username throw error

        else {
            bcrypt.hash(data.password.toString(), +saltRounds) // + laver saltrounds fra string til number
                .then(async function(hash) { // After password is hashed calls the funtion with the hashed password stored in hash
                    createAccount(data, hash)
                    res.send(true);
                });
        }
    } catch (err) {
        await errorHandling(err, res);
    }
}


/**
 * verifies token is issued from this server. if it is, it responds with users username and password for the domain
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response sent to the user. This either sends a 401, error handling, or username/password
 */
async function getPassword(req, res) {

    jwt.verify(req.token, secretKey, async(err, authData) => { // Verifies the authenticity of the token.
        try {
            const data = req.body
            const domainStripped = data.domain.split("/")[2] // Saves the part of the domain that doesn't include http(s).
            let userData = (await findLoginInfo(authData, domainStripped))[0]; // Stores the table data in position 0 as userdata.

            // Error handling
            if (err) res.sendStatus(401);
            else if (data.domain === undefined) throw "domain not found";
            else if (userData === undefined) throw "no login data for domain";

            // If no errors received
            else {
                userData = await stripQuotes(userData) // Removes ' from object
                res.json(userData); // Returns username and password
            }

        } catch (err) {
            await errorHandling(err, res);
        }
    });
}


/**
 * Takes information about a new username, password on a new domain and writes it to the users Json file 
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. this either sends a 401, errormessages, false or true. responds true if everything went well
 */
async function addUserInfo(req, res) {

    jwt.verify(req.token, secretKey, async(err, authData) => { // Verifies the authenticity of the token.
        try {
            const data = req.body;
            const user = await findUserDB(authData); // Find current user on the database.
            const domainStripped = data.domain.split("/")[2]; // Saves the part of the domain that doesn't include http(s).
            const result = await findLoginInfo(authData, domainStripped); // Assignes the loginInfo found to the results variable

            // Error handling
            if (err) res.sendStatus(401);
            else if (data.domain === undefined || data.username === undefined || data.password === undefined) throw "Data was not filled correctly"; // If userdata is not received properly of if any is missing throw error
            else if (user.length !== 1) throw user.length < 1 ? "No user with given credentials please log out and back in" : "More than one user found contact support"; // If no user was found, or more than one was found, throw error.
            else if (result.length > 0) throw "Account already created for this website"; // If userdata is found for current domain, throw error

            // If no errors recieved
            else {
                insertIntoUserTable(authData, data, domainStripped) // Inserts the new login into the users personal table
                    .then(res.send(true)); // Responds with true when data is inserted
            }
        } catch (err) {
            await errorHandling(err, res);
        }
    })
}


/**
 * Confirms a token is valid and responds with username from the token.
 * @param {Object} req request to server. includes authorization header to be verified
 * @param {Object} res object to send response to user. used to send either error message og username.
 */
async function confirmUsername(req, res) {

    jwt.verify(req.token, secretKey, async(err, authData) => { // Verifies the authenticity of the token.
        try {
            if (err || authData.username === undefined) res.sendStatus(401);
            else res.json({ username: authData.username }); // Responds with the users name

        } catch (err) {
            await errorHandling(err, res);
        }
    })
}


/**
 * Used to delete a master account from the database
 * @param {Object} req request to the server. This includes the authorization header to be verified
 * @param {Object} res object that sends the response to the user. Used to send either error or confirmation message
 */
async function deleteAccount(req, res) {
    jwt.verify(req.token, secretKey, async(err, authData) => { // Verifies the authenticity of the token.
        try {
            if (err || authData.username === undefined || authData.id === undefined) res.sendStatus(401);
            else deleteUserdataFromDB(authData) // Deletes the user
                .then((err) => { // After account is deleted 
                    if (err) throw err
                    else res.send(true) // If no errors send true back
                })
        } catch (err) { await errorHandling(err, res); }
    })
}


/**
 * is called when an error is caught. responds to client with given error and console logs it.
 * @param {Object} err includes whatever went wrong in the program
 * @param {Object} res sends response using this object.
 */
async function errorHandling(err, res) { // Generalized error handling.
    res.json({ error: err }); // Respond to client with error message thrown above
    console.log(err); // Logs error message from above
}


/**
 * Middleware that verifies an authorization token is received. it is the saved in req.token for future functions to user
 * @param {Object} req req is the request the user sends to the server.
 * @param {Object} res res is the response to send the user. only used if token is not present.
 * @param {Function} next calls the next function (middleware or other function)
 */
function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"]; // Get the auth header value

    // Error handling
    if (bearerHeader === undefined) res.sendStatus(401); // Status 401 stands for unauthorized} { //check if bearer is undefined

    // If no errors recieved
    else {
        const bearer = bearerHeader.split(" "); // Split at the space
        req.token = bearer[1]; // Set the token
        next(); // Next function
    }
}