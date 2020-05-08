//Event Listeners
document.getElementById("LogIn-form").addEventListener("submit", loginFormSubmit);
//document.getElementById("SignedIn-submit").addEventListener("click", retrievePassword);
document.getElementById("LogoutButton").addEventListener("click", clearToken);
const { hashCode, postRequest } = require("./util.js")

chrome.runtime.sendMessage({ getToken: true }, function(response) { //gets token from background script. whatever is done with it should be done in this callback function
    if (response.token !== null) signInCSS();
});

/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function loginFormSubmit(event) {
    event.preventDefault();

    const form = document.getElementById("LogIn-form"); //Gets information from form and inserts in the object jsondata       

    chrome.storage.local.get([form.username.value], async function(result) { //The function to load the saved pepper string from the property username in local storage (idk from where).
        const form = document.getElementById("LogIn-form"); //Gets information from form and inserts in the object jsondata       
        const pepperPass = form.password.value.concat(result[form.username.value]); //concatinates password with the loaded pepper
        const jsondata = { //An object containing the username and hashed password.
            username: form.username.value,
            password: hashCode(pepperPass)
        };

        let answer = await postRequest("validate", jsondata); // contacts server to validate user login. should login if username and password is correct.
        answer = await answer.json(); //parses the response

        if (answer.error !== undefined) { //Checks if the answer is an error message
            incorrectInfoCSS(); //Displays an error message in case the entered username or password is wrong.

        } else {
            chrome.runtime.sendMessage({ token: "bearer " + answer.token }, function(response) { //saves the token to backgroundscript
                if (response.success === true) {
                    signInCSS();
                } else {
                    console.log("*An error has occured*"); //Error message if the response is false.
                }
            });
        }
        form.reset(); //Resets the form
    })
}


/**
 * Sends a null token as current token to the background script
 * Changes the style of the dom and calls the switchPage function
 */
function clearToken() { //Logout function: reset the token to null
    chrome.runtime.sendMessage({ token: null }, function(response) { //Sets the token to null (logged out)
        if (response.success == true) {
            let signedInPage = document.getElementById("SignedIn");
            let logoutPage = document.getElementById("Logout");

            document.getElementById("Settings").style.display = "none";
            switchPage(signedInPage, logoutPage); //Hides the signed-in page and shows logout 

        } else {
            console.log("*An error has occured*"); //Error message if the response is false.
        }
    });
}


//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------

/**
 * Hides a HTML Div and shows another
 * @param {Object} hidePage 
 * @param {Object} showPage 
 */
function switchPage(hidePage, showPage) { //Changes display attribute of elements.
    hidePage.style.display = "none";
    showPage.style.display = "inline";
}

/**
 * Changes the style of the DOM when the user is logged in. 
 * Calls the switchPage function.
 */
function signInCSS() {
    let hidePage = document.getElementById("LogIn");
    let showPage = document.getElementById("SignedIn");
    let settingsButton = document.getElementById("Settings");

    settingsButton.style.top = "110px";
    settingsButton.style.left = "58px";
    settingsButton.style.padding = "5px";
    settingsButton.style.paddingBottom = "4px";
    settingsButton.style.paddingLeft = "27px";
    settingsButton.style.paddingRight = "27px";

    switchPage(hidePage, showPage);
}

/**
 * Changes the style of the DOM when the user inputs incorrect login information. 
 * Display an error message.
 */
function incorrectInfoCSS() { //Sets the CSS settings in case of incorrect input
    document.getElementById("LogIn-username").style.borderColor = "red";
    document.getElementById("LogIn-password").style.borderColor = "red";
    document.getElementById("LogIn-paragraph").style.display = "inline";
}