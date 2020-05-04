document.querySelector("form").addEventListener("submit", addAccount); //adds an event listener to the submit-button in the html.
const { generatePassword } = require("./util.js")

/**
 * TODO
 * @param {*} event 
 */
async function addAccount(event) {
    event.preventDefault();

    chrome.runtime.sendMessage({ getToken: true }, async function(response) {

        if (response.token === undefined || response.token === null) {
            // TODO STUB ERROR HANDLING
            console.log("response.token is undefined");
            return;

        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
                // since only one tab should be active and in the current window at once
                // the return variable should only have one entry
                let form = document.getElementById("form"); //defines the form from the html-document addWebsiteAccount.html
                let location = tabs[0].url;

                let jsondata = { //This is the object that is sent to the server and saved in the json folder in the users dedicated databases JSON-file
                    username: form.username.value,
                    password: generatePassword(), //Calls a function that generates a password between 15-20 characters long.
                    domain: location
                };

                let answer = await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/updateInfo", { //Sends a fetch request to the server with the identifying token and the jsondata object
                    method: 'POST', // Fetch method used to send data to the server to update the database.
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": response.token
                    },
                    body: JSON.stringify(jsondata, null, 2) //Makes sure that the object jsondata can be interpreted by the JSON-format
                });
                answer = await answer.json() //answer from the server

                if (answer.error != undefined) { //Checks if the answer is a error message
                    console.log(answer.error);
                    failedAccountCreationCSS(answer.error);

                } else { //If there was no error message.
                    console.log("Account added");
                    successAccountCreationCSS();
                }
                form.reset();
            })
        }
    })
}
printsURL(); //Prints url for current website.

//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------

/**
 * TODO
 */
function printsURL() { // printsURL simply prints to the screen the URL of the current site for clarity in the account creation.
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        let location = tabs[0].url;
        location = location.split("/")[2]; //Splits the address up at the position of the slashes.
        document.getElementById("URLgoesHere").innerHTML = location; //Writes the address to the password manager window.
    })
}

/**
 * TODO
 */
function successAccountCreationCSS() { // successAccountCreationCSS alters the styes of the page after a succesful creation.
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
 * TODO
 */
function failedAccountCreationCSS(err) { // failedAccountCreationCSS alters the styles of the page after a failed creation.
    let addPage = document.getElementById("addWebsite");
    let errorPage = document.getElementById("error");
    let message = document.getElementById("errorMessage");

    addPage.style.display = "none";
    errorPage.style.display = "inline";

    message.innerHTML = err;

}