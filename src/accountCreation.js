document.querySelector("form").addEventListener("submit", accountCreationSubmit) //Event Listener
const cryptoRandomString = require('crypto-random-string'); //Require module with the help of browserify/watchify.
const { hashCode, checkRegex, postRequest } = require("./util.js")

/**
 * Submits user inputted username and password to the server.
 * Alters the CSS of the extension according to the answer from the server.
 * @param {object} event event is the trigger for the function. It is used to prevent default behaviour of the submit method in a form.
 */
async function accountCreationSubmit(event) {
    event.preventDefault() // Prevents the submit button from triggering and submitting the form right away.
    const form = document.getElementById("form"); // Set variable to an element from NewUser.html. Done to obtain password and username submitted by user. 

    // Compares passwords and checks if it complies with the rules: at least 8 characters; 1 numeric, 1 lower- and 1 upper case character.
    if (form.password1.value == form.password2.value && checkRegex(form.password1.value) === true) {

        const pepperString = cryptoRandomString({ length: 20, type: 'base64' }); // Generates a pepper string of length 20 encrypted in base64: meaning numerics, upper and lower case characters.
        const pepperPassword = form.password1.value.concat(pepperString); // Concatenates pepper to the password inputted by the user.
        let jsondata = { // An object containing the username and hashed password.
            username: form.username.value,
            password: hashCode(pepperPassword)
        };

        let answer = await postRequest("newUser", jsondata) // Sends a fetch request to "newUser" page
        answer = await answer.json() // Parses the user data to JSON

        if (answer.error !== undefined) { // Checks if the answer is a error message (In case the username is already in use on the database.)
            userExistCSS(); // Changes the CSS

        } else { // If there was no error message.
            chrome.storage.local.set({
                [jsondata.username]: pepperString
            }, () => { // Stores the generated pepper in local storage in an object named after the username
                savedUserCorrectlyCSS(); // Changes the CSS
            });
        }

    } else { // If we get to this 'else' there are two options

        if (form.password1.value !== form.password2.value) passwordsNotIdenticalCSS(); // The passwords do not match 
        else passwordRequirementsCSS(); // The password does not meet the requirements
    }
    form.reset(); // Reset the forms to allow for new input.
}

//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------

/**
 * Changes the CSS settings for when the user is saved correctly
 */
function savedUserCorrectlyCSS() {
    let returnButton = document.getElementById("return");

    document.getElementById("accountCreation").style.display = "none";
    document.getElementById("accountSuccess").style.display = "inline";

    returnButton.style.position = "relative";
    returnButton.style.top = "160px";
    returnButton.style.fontSize = "1.3em";
    returnButton.style.padding = "10px 20px 10px 20px";
    returnButton.style.marginLeft = "18px";
}
/**
 * Changes the CSS settings in case that the user already exist
 */
function userExistCSS() {
    // Resets to original
    document.getElementById("wrongPassword").style.display = "none"; // Not to have two error messages on top of eachother
    document.getElementById("firstPassword").style.borderColor = "#101010";
    document.getElementById("secondPassword").style.borderColor = "#101010";

    // Makes body longer and displays error to the user
    //document.body.style.height = "310px";
    document.getElementById("tooltip").style.top = "235px";
    document.getElementById("create").style.top = "290px";
    document.getElementById("return").style.top = "290px";
    document.getElementById("username").style.borderColor = "#BA1919";
    document.getElementById("inUse").style.display = "inline";
    document.getElementById("conditions").style.display = "none"; // In case the user earlier didnt meet the requirements. 
}
/**
 * Changes the CSS settings in case their passwords do not match
 */
function passwordsNotIdenticalCSS() {
    // Resets to original
    document.getElementById("inUse").style.display = "none"; // Not to have two error messages on top of eachother
    document.getElementById("username").style.borderColor = "#101010";
    document.getElementById("conditions").style.display = "none"; // In case the user earlier did not meet the requirements. 

    // Makes the body bigger, so there is room for a label, moves the buttons down, changes border colors on  the password fields and display the message.
    //document.body.style.height = "310px";
    document.getElementById("username").style.borderColor = "#101010";
    document.getElementById("tooltip").style.top = "235px";
    document.getElementById("create").style.top = "290px";
    document.getElementById("return").style.top = "290px";
    document.getElementById("inUse").style.display = "none";
    document.getElementById("firstPassword").style.borderColor = "#BA1919";
    document.getElementById("secondPassword").style.borderColor = "#BA1919";
    document.getElementById("wrongPassword").style.display = "inline";
}
/**
 * Changes the CSS settings in case the password has not met the requirements of: 1 numeric-, 1 lower-, 1 upper- case character and atleast 8 characters
 */
function passwordRequirementsCSS() {
    // Resets to original
    document.getElementById("wrongPassword").style.display = "none";
    document.getElementById("inUse").style.display = "none";

    // Makes the body bigger moves objects and shows error message to the user
    document.body.style.height = "350px";
    document.getElementById("tooltip").style.top = "270px";
    document.getElementById("create").style.top = "320px";
    document.getElementById("return").style.top = "320px";
    document.getElementById("conditions").style.display = "inline";
}