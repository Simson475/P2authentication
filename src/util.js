/**
 * Hashes a string
 * @param {string} str The string that will be hashed.
 */
function hashCode(str) { //Stolen from the internet.
    return str.split('').reduce((prevHash, currVal) =>
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

/**
 * The function run the Regex test on the password, which is send as a parameter. Then returns the  password.
 * @param {string} password Takes the password as parameter which is a string.
 */
function checkRegex(password) {
    let regex = /(?=.{8,}$)((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]))/;
    return regex.test(password)
}

/**
 * Generates a password through a process of picking randomly between the characters in the array str, and return it as an array.
 */
function generatePassword() { // Generates a random string of a length between 15 to 20 characters by using math.random to choose a random character in an array of all the characters that we allow to be used in a password.
    let password = [],
        str = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'O', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
    let passLength = Math.floor(Math.random() * 5) + 15; //the constant 15 is arbitrarily chosen as the minimum length for the password, Math.random * 5 varies the password length by up to 5 characters.
    for (let i = 0; i <= passLength; i++) {
        password[i] = str[Math.floor(Math.random() * 60)]; //Selects the i'th position in password to be a pseudorandom number in the 61 character long string 'str'
    }
    return password.join(''); //Joins together the array 'password' into a string.
}

/**
 * Sends a post request to ther server
 * Returns the server answer
 * @param {String} location Contains the path that the post request is send to
 * @param {Object} jsondata Contains the information that is being send to the server
 * @param {String} token contains the users token
 * The token is by default undefined if there is none. SKULLE DETTE IKKE VÆRE NULL???
 */

async function postRequest(location, jsondata, token = undefined) {
    return await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/" + location, { //Fetch respons from server to modify the database
        method: 'POST', // Fetch method used to send data to the server to update the database.
        headers: {
            'Content-Type': 'application/json',
            "authorization": token
        },
        body: JSON.stringify(jsondata, null, 2) //Data to send to the server.
    });
}

module.exports = { hashCode, checkRegex, generatePassword, postRequest }