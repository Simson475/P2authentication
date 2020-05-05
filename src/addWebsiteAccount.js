document.getElementById("AutofillPassword").addEventListener("click", passwordAutofill);    // Adds an event listener to the button 'Autofill'
let currentPassword = null; // Sets the password variable to null made globl so that we can access from multiple functions. 
const { generatePassword, postRequest } = require("./util.js") // Imports the needed functions from util.js



/**
  * passwordAutofill generates the password for the account and asks the content script to autofill it. 
  */
 function passwordAutofill() {

    document.getElementById("AutofillPassword").removeEventListener("click", passwordAutofill); // Removes the event listener to the autofill in the html.
    document.getElementById("theSubmitButton").style.display = "inline"                         // Shows theSubmitButton fron the HTML doc addWebsiteAccount.
    document.querySelector("form").addEventListener("submit", addAccount);                      // Adds an event listener to the submit-button in the html.                 

    chrome.runtime.sendMessage({ getToken: true }, async function(response) { // Checks whether or not a session based authentication cookie is set.
        if (response.token === undefined || response.token === null) {  // Checks whether the token is null or undefined.
            // TODO STUB ERROR HANDLING
            console.log("response.token is undefined");
            return;

        } else {
            currentPassword = generatePassword(); // Generates a password of 15-20 characters and places it into the currentpassword global variable. 
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) { // Query that returns an array of all active and current chrome windows, will only return 1.
                await chrome.tabs.sendMessage(tabs[0].id, { autofillPassword: currentPassword }, function(response) { // Sends a message to be read in content.js

                    console.log(response.autofillListenerResponse);
                    if (response.autofillListenerResponse === true){ // Successfully sent and received response to message
                        console.log("response succesful");
                    }
                    else if (response.autofillListenerResponse === false){ // The request sent to Content did not complete successfully
                        console.log("Response from content.js failed");
                    }
                    else {
                        console.log("very very bad dog....");
                        //VERY BIG ERROR should never end here
                    }
                });
            });
        }
    });
};

/**
 * Allows the user to, if authenticated through JWT, to add a website account to the database.
 * @param {object} event event is the event that triggers the function. It is used to prevent default behaviour of the submit method in a form.
 */
async function addAccount(event) {
    event.preventDefault();

    chrome.runtime.sendMessage({ getToken: true }, async function(response) {// Sends message to the background script to check for a session authentication. All responses should be within the session.
        console.log(response.token)
        if (response.token === undefined || response.token === null) {// If not authenticated with token
            // TODO STUB ERROR HANDLING
            console.log("response.token is undefined");
            return;

        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) { // Query that returns an array of all active and current chrome windows, will only return 1.
                let form = document.getElementById("form"); // Sets a variable to the form from addWebsiteAccount.html
                let location = tabs[0].url; // Lets a variable contain the url for the current website 
                let jsondata = { // This is the object that is sent to the server and saved in the json folder in the users dedicated databases JSON-file
                    username: form.username.value,
                    password: currentPassword, // Calls a function that generates a password between 15-20 characters long.
                    domain:   location
                };
                console.log(jsondata);
                let answer = await postRequest("updateInfo", jsondata, response.token) // Sends a Fetch request of type 'POST' to the server, adding an account to the database. 

                answer = await answer.json()     // Parses the answer from the server to the JSON format

                if (answer.error !== undefined) { 
                    console.log("answer: " + answer)// Checks if the answer from the server is a error message
                    console.log(answer.error);  
                    failedAccountCreationCSS(answer.error); // Changes the CSS

                } else { // If there was no error message.
                    console.log("Account added");
                    successAccountCreationCSS(); // Changes the CSS
                }
                form.reset(); // Resets the form
            })
        }
    })
}
printsURL(); // Prints url for current website.

//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------

/**
 *  printsURL simply prints to the screen the URL of the current site for clarity in the account creation.
 */
function printsURL() { 
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { // Query that returns an array of all active and current chrome windows, will only return 1.
        let location = tabs[0].url;
        location = location.split("/")[2]; // Splits the address up at the position of the slashes. (ex. "https://  facebook.com")
        document.getElementById("URLgoesHere").innerHTML = location; // Prints the address to the password manager window.
    })
}

/**
 *  successAccountCreationCSS alters the styes of the page after a succesful account creation.
 */
function successAccountCreationCSS() { 
    let message = document.getElementById("h3");
    let form = document.getElementById("form");
    form.style.display = "none";
    message.innerHTML = "Login Added";
    let returnButton = document.getElementById("return");
    returnButton.innerHTML = "Go back";
    returnButton.style.top = "100px";
    returnButton.style.left = "40px ";
    returnButton.style.fontSize = "1.3em";
    returnButton.style.padding = "10px 20px 10px 20px";
    returnButton.style.marginLeft = "18px";

}

/**
 *  failedAccountCreationCSS alters the styles of the page after a failed account creation.
 */
function failedAccountCreationCSS(err) { 
    let addPage = document.getElementById("addWebsite");
    let errorPage = document.getElementById("error");
    let message = document.getElementById("errorMessage");

    addPage.style.display = "none";
    errorPage.style.display = "inline";

    message.innerHTML = err;

}