require("dotenv").config();
const mysql = require("mysql"); //allows communication with database (mysql)
const util = require('util'); //used for promisify wrapper of mysql queries


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
 * TODO
 * @param {*} data 
 * @param {*} hash 
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
 * TODO
 * @param {*} authData 
 */
async function deleteUserdataFromDB(authData) {
    await db.query("DROP TABLE user" + authData.id) //inserts data into the users personal table
    await db.query("DELETE FROM loginTable WHERE id= " + authData.id) //inserts data into the users personal table
}


/**
 * TODO
 * @param {*} userData 
 */
async function stripQuotes(userData) {
    userData.domain = userData.domain.split("'")[1]; //strips ' (the sql protection)
    userData.username = userData.username.split("'")[1]; //strips ' (the sql protection)
    userData.password = userData.password.split("'")[1]; //strips ' (the sql protection)
    return userData
}

async function closeDB() { db.close() }

module.exports = { createAccount, findUserDB, deleteUserdataFromDB, stripQuotes, closeDB }