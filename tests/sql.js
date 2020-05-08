const { createAccount, findUserDB, stripQuotes, deleteUserdataFromDB, closeDB, findLoginInfo, insertIntoUserTable } = require("../Server/mysqlUtil.js")
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


const local = { // Local development server on simon PC
    host: "localhost",
    user: "root",
    password: "Password1234",
    database: "PWMAN"
};

const online = { // Mysql server hosted on university server. 
    host: "localhost",
    user: "sw2b2-23@student.aau.dk",
    password: "ss5fNRfsdNXSaryL",
    database: "sw2b2_23"
};


// Connects to onineDB of online. else connects to offline.
let db
beforeAll(() => {
    db = process.env.PRODUCTION === "true" ? makeDb(online) : makeDb(local);

})
afterAll(async() => {
    closeDB();
    db.close();
})

test("Should create an account on the sql database", async() => {

    await createAccount({ username: "CreateTest1" }, "Hj824TLo9dmbo9he7yJo") // Calls the createAccount function with the insertet userData.
    const sql = "SELECT * FROM loginTable WHERE username= \"" + mysql.escape("CreateTest1") + "\""; // Defines the query that's send to the DB asking for the created account.

    const firstcheck = await db.query(sql); // Sends query to DB
    expect(firstcheck[0].username).toBe("'CreateTest1'") // Tests to see if the username is equal to the expected one.
    expect(firstcheck[0].hashValue).toBe("Hj824TLo9dmbo9he7yJo") // Tests to see if the hashvalue is equal to the expected one.

    const tables = await db.query("SHOW tables"); // Sends query to DB

    const secondCheck = tables.find((elem) => elem[Object.keys(elem)[0]] == "user" + firstcheck[0].id) // Finds the user with the id given to the created user.
    expect(secondCheck).not.toBe(undefined) // Since we've just created the account the user shouldn't be undefined.

    //cleanup
    await db.query("DROP TABLE user" + firstcheck[0].id) // Deletes the table for the id given to the created user.
    await db.query("DELETE FROM loginTable WHERE id= " + firstcheck[0].id) // Deletes the table for the given id in the loginTable.
})

test("Should delete a user", async() => {

    const data = { username: "hopefullyDeletedSoon" } // (Assigns) the data used to create the test user
    await db.query("INSERT INTO loginTable SET ?", { username: mysql.escape(data.username), hashValue: "Lo97ghY7gnp8dh7&dikn" }); // Sends a db.query to create the test user on the database.
    const currentUser = await findUserDB(data); // Finds the userdata for the created account and assignes it to currentUser.
    await db.query("CREATE TABLE user" + currentUser[0].id + "( domain VARCHAR(255), username VARCHAR(255),password VARCHAR(255), PRIMARY KEY(domain))"); // Creates a table for the user in the loginTable
    await deleteUserdataFromDB(currentUser[0]) // Deletes the formerly created test user.
    const sql = "SELECT * FROM loginTable WHERE username= \"" + mysql.escape(data.username) + "\""; // Finds the table for the testUser in loginTable

    const firstcheck = await db.query(sql); // Sends query to DB
    expect(firstcheck.length).toBe(0) // Since the user should be deleted the length of the found user should be 0.
})

test("Should strip quotes from data received from database", async() => {
    const data = { domain: "'www.shouldBeStripped.co.uk'", username: "'stripMcStrippy'", password: "'strippysStrippedPassword'" } // Assigns the test data we're going to use.
    const result = { domain: "www.shouldBeStripped.co.uk", username: "stripMcStrippy", password: "strippysStrippedPassword" } // Assigns the expected result data.

    expect(await stripQuotes(data)).toEqual(result) // Compares the calculated results with the expected result.

})

test("shoud find login info for the user", async() => {
    const authData = { id: 7 } // Assigns the test id used
    const domainStripped = "www.facebook.com" // Assigns an already stripped domain
    const result = { domain: "'www.facebook.com'", username: "'Simon'", password: "'eHXZzquUIuXPsSaLy'" } // Assignes the expected result

    const firstCheck = (await findLoginInfo(authData, domainStripped))[0] // Calls findLoginInfo with the test id and domain 
    expect(firstCheck).toEqual(result) // Compares the data found on the database with the expected result
})

test("Should insert data into usertable on database", async() => {

    // In case of tests break before. cleans up
    await db.query("DELETE FROM user7 WHERE domain = \"'testwebsite.com'\"") // Resets the databasa by removing the inserted data to be ready for another test.

    //start test
    let authData = { id: 7 } // Assigns the test id used
    let data = { username: "InersertysFancyInsertableUsername", password: "IntertyMcIntertyInsertablePassword" } // Assigns the test data used
    let domainStripped = "testwebsite.com" // Assigns a stripped domain
    let result = { domain: "'testwebsite.com'", username: "'InersertysFancyInsertableUsername'", password: "'IntertyMcIntertyInsertablePassword'" } // Assigns the expected result
    await insertIntoUserTable(authData, data, domainStripped); // Inserts the testData into the user with the id 7.

    const firstCheck = await db.query("SELECT * FROM user7 WHERE domain = \"'testwebsite.com'\"") // Finds the data for the testWebsite for user7 on the database
    expect(firstCheck[0]).toEqual(result) // Compares the collected data with the expected result data

    // Cleanup
    await db.query("DELETE FROM user7 WHERE domain = \"'testwebsite.com'\"") //  Resets the databasa by removing the inserted data to be ready for another test.

})