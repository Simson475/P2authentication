require("dotenv").config();
const mysql = require("mysql"); //allows communication with database (mysql)
const util = require('util'); //used for promisify wrapper of mysql queries


/**
 * Promisify wrapper lets us use db as promises instead of with callback functions. 
 * @param {Object} login information needed to login to the server. should as a minimum include host user and password.
 */
function makeDb(login) {
    const dbConnection = mysql.createConnection(login); //makes dbConnection to database
    return { //returns object with two methods
        query(sql, args) {
            return util.promisify(dbConnection.query) //a promisified version of queries
                .call(dbConnection, sql, args);
        },
        close() {
            return util.promisify(dbConnection.end).call(dbConnection); //promisified version of ending the connection with the server gracefully.
        }
    };
}


const local = { //local development server on simon PC
    host: "localhost",
    user: "root",
    password: "Password1234",
    database: "PWMAN"
};

const online = { //mysql server hosted on university server. 
    host: "localhost",
    user: "sw2b2-23@student.aau.dk",
    password: "ss5fNRfsdNXSaryL",
    database: "sw2b2_23"
};


//connects to onineDB of online. else connects to offline.
const db = process.env.PRODUCTION === "true" ? makeDb(online) : makeDb(local)


/**
 * Creates an accounts on the mySQL database using db.querys to send inputs to the database.
 * @param {object} data contains the username of the userdata 
 * @param {object} hash contains the hashValue for the user
 */
async function createAccount(data, hash) {
    await db.query("INSERT INTO loginTable SET ?", { username: mysql.escape(data.username), hashValue: hash }); //mysql.escape is used to escape when we accept user input, so they can't give the server input.
    let currentUser = await findUserDB(data); //finds the ID for the user
    await db.query("CREATE TABLE user" + currentUser[0].id + "( domain VARCHAR(255), username VARCHAR(255),password VARCHAR(255), PRIMARY KEY(domain))"); //Creates a table for the user in the loginTable
}

/**
 * Sends a query to MySQL database and return the user with given username 
 * @param {Object} data data should have a property.username that has the current users username.
 */
async function findUserDB(data) { //looks up a given user in the database tables.
    if (data.username !== undefined) {
        let sql = "SELECT * FROM loginTable WHERE username= \"" + mysql.escape(data.username) + "\""; // Select a table from the table loginTable with the username data.username
        return await db.query(sql); //sends query to DB

    } else if (data.id !== undefined) {
        let sql = "SELECT * FROM loginTable WHERE id= " + data.id; // Select a table from the table loginTable with the username data.username
        return await db.query(sql); //sends query to DB 

    } else throw "no info for findUserDB"
}

/**
 * Deletes a user from our databse. this is only used on account deletion.
 * @param {Object} authData authdata comes from the jsonwebtoken. it should include the useres id as a minimum
 */
async function deleteUserdataFromDB(authData) {
    await db.query("DROP TABLE user" + authData.id) //inserts data into the users personal table
    await db.query("DELETE FROM loginTable WHERE id= " + authData.id) //inserts data into the users personal table
}


/**
 * Strips the ' marks from our sql data. this is needed since we only apply them to sanitize the inputs of our DB
 * @param {Object} userData userdata is the data we needed to sanitize
 */
async function stripQuotes(userData) {
    for (elem in userData) { //iterates over all properties in object
        userData[elem] = userData[elem].split("'")[1]; //strips ' (the sql protection)
    }
    return userData //returns destripped userdata
}




/**
 * finds the login information for the given domain for the user.
 * @param {object} authData contains the userdata needed which is the id given to the user on the database here.
 * @param {object} domainStripped contains the stripped version of the domain needed.
 */
async function findLoginInfo(authData, domainStripped) {
    let sql = "SELECT * FROM user" + authData.id + " WHERE domain= \"" + mysql.escape(domainStripped) + "\""; //looks up the Domain under the userID to see if there is stored info for the website.
    return await db.query(sql); //stores the table data in position 0 as userdata.
}


/**
 * Inserts the given logindata for a website to a users loginTable.
 * @param {object} authData contains the user id needed to lookup the user on the database
 * @param {object} data contains the userna and password needed to be stored for the website
 * @param {object} domainStripped contains the stripped version of the domain we're storing data for
 */
async function insertIntoUserTable(authData, data, domainStripped) {
    let parameter = { domain: mysql.escape(domainStripped), username: mysql.escape(data.username), password: mysql.escape(data.password) }; //creates object we want to save in DB
    await db.query("INSERT INTO user" + authData.id + " SET ?", parameter) //inserts data into the users personal table
}

async function closeDB() { db.close() } //closes DB connection

module.exports = { createAccount, findUserDB, deleteUserdataFromDB, stripQuotes, closeDB, findLoginInfo, insertIntoUserTable }