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
let db
beforeAll(() => {
    db = process.env.PRODUCTION === "true" ? makeDb(online) : makeDb(local);

})
afterAll(async() => {
    closeDB();
    db.close();

})

test("Should create an account on the sql database", async() => {
    await createAccount({ username: "CreateTest1" }, "Hj824TLo9dmbo9he7yJo")
    let sql = "SELECT * FROM loginTable WHERE username= \"" + mysql.escape("CreateTest1") + "\"";
    const firstcheck = await db.query(sql); //sends query to DB
    expect(firstcheck[0].username).toBe("'CreateTest1'")
    expect(firstcheck[0].hashValue).toBe("Hj824TLo9dmbo9he7yJo")
    const tables = await db.query("SHOW tables"); //sends query to DB

    let secondCheck = tables.find((elem) => elem[Object.keys(elem)[0]] == "user" + firstcheck[0].id)
    expect(secondCheck).not.toBe(undefined)

    //cleanup
    await db.query("DROP TABLE user" + firstcheck[0].id)
    await db.query("DELETE FROM loginTable WHERE id= " + firstcheck[0].id)
})

test("Should delete a user", async() => {
    const data = { username: "hopefullyDeletedSoon" }
    await db.query("INSERT INTO loginTable SET ?", { username: mysql.escape(data.username), hashValue: "Lo97ghY7gnp8dh7&dikn" }); //mysql.escape is used to escape when we accept user input, so they can't give the server input.
    let currentUser = await findUserDB(data); //finds the ID for the user
    await db.query("CREATE TABLE user" + currentUser[0].id + "( domain VARCHAR(255), username VARCHAR(255),password VARCHAR(255), PRIMARY KEY(domain))"); //Creates a table for the user in the loginTable

    await deleteUserdataFromDB(currentUser[0])
    let sql = "SELECT * FROM loginTable WHERE username= \"" + mysql.escape(data.username) + "\"";
    const firstcheck = await db.query(sql); //sends query to DB
    expect(firstcheck.length).toBe(0)
})

test("Should strip quotes from data received from database", async() => {
    let data = { domain: "'www.shouldBeStripped.co.uk'", username: "'stripMcStrippy'", password: "'strippysStrippedPassword'" }
    let result = { domain: "www.shouldBeStripped.co.uk", username: "stripMcStrippy", password: "strippysStrippedPassword" }
    expect(await stripQuotes(data)).toEqual(result)

})

test("shoud find login info for the user", async() => {
    let authData = { id: 7 }
    let domainStripped = "www.facebook.com"
    let result = { domain: "'www.facebook.com'", username: "'Simon'", password: "'eHXZzquUIuXPsSaLy'" }
    let firstCheck = (await findLoginInfo(authData, domainStripped))[0]
    expect(firstCheck).toEqual(result)
})

test("Should insert data into usertable on database", async() => {

    //in case of tests break before. cleans up
    await db.query("DELETE FROM user7 WHERE domain = \"'testwebsite.com'\"") // resets the databasa by removing the inserted data to be ready for another test.

    let authData = { id: 7 }
    let data = { username: "InersertysFancyInsertableUsername", password: "IntertyMcIntertyInsertablePassword" }
    let domainStripped = "testwebsite.com"
    let result = { domain: "'testwebsite.com'", username: "'InersertysFancyInsertableUsername'", password: "'IntertyMcIntertyInsertablePassword'" }
    await insertIntoUserTable(authData, data, domainStripped);
    const firstCheck = await db.query("SELECT * FROM user7 WHERE domain = \"'testwebsite.com'\"")
    expect(firstCheck[0]).toEqual(result) //

    //cleanup
    await db.query("DELETE FROM user7 WHERE domain = \"'testwebsite.com'\"") // resets the databasa by removing the inserted data to be ready for another test.

})