//Event Listeners
document.getElementById("LogIn-form").addEventListener("submit", formSubmit);
document.getElementById("SignedIn-submit").addEventListener("click", retrievePassword);
document.getElementById("LogoutButton").addEventListener("click", clearToken);
const { hashCode, postRequest } = require("./util.js")
chrome.runtime.sendMessage({ getToken: true }, function(response) { //gets token from background script. whatever is done with it should be done in this callback function
    if (response.token === null) return;
    else retrieveElementInformationCSS("SignIn");
});

/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function formSubmit(event) {
    event.preventDefault();

    let form = document.getElementById("LogIn-form"); //Gets information from form and inserts in the object jsondata       

    chrome.storage.local.get([form.username.value], async function(result) { //The function to load the saved pepper string from the property username in local storage (idk from where).
        let form = document.getElementById("LogIn-form"); //Gets information from form and inserts in the object jsondata       
        let pepperPass = form.password.value.concat(result[form.username.value]); //concatinates password with the loaded pepper
        let hashedPass = hashCode(pepperPass);
        let jsondata = { //An object containing the username and hashed password.
            username: form.username.value,
            password: hashedPass
        };
        let answer =  await postRequest("validate", jsondata);

        answer = await answer.json(); //parses the response

        if (answer.error != undefined) { //Checks if the answer is a error message
            console.log(answer);
            incorrectInfoCSS(); //Displays an error message in case the entered username or password is wrong.


        } else {
            chrome.runtime.sendMessage({ token: "bearer " + answer.token }, function(response) { //saves the token to backgroundscript
                console.log("Bearer token successfully saved");
                if (response.success == true) {
                    retrieveElementInformationCSS("SignIn"); //Variables used in switchPage   
                } else {
                    console.log("*An error has occured*"); //Error message if the response is false.
                }
            });
        }
        form.reset();
    })

}

/**
 * retrievePassword retrives the username and password for the given domain.
 * @param {Object} event 
 */
async function retrievePassword(event) { // LoggedIn script (listens for click on getpassword button)
    event.preventDefault()

    chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function
        console.log(response);
        if (response.token === null) return; // todo error handling
        else if (response.token === undefined) {
            //STUB ERROR HANDLING
            console.log("response.token is undefined")
            return;
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) { //Collects information on the active tab.
                // since only one tab should be active and in the current window at once
                // the return variable should only have one entry
                let activeTab = tabs[0];

                //Contacts server and requests username and password for the domain passed in the body
                let answer = await postRequest("getPassword", {domain: activeTab.url}, response.token);

                answer = await answer.json() //parses the response

                if (answer.error != undefined) { //Checks if the answer is a error message
                    console.log(answer);
                    retrieveElementInformationCSS("Error", answer);


                } else { //If there was no error message.
                    retrieveElementInformationCSS("retrievePassword", answer);
                    autofill(answer.username, answer.password);
                }

            });
        }
    });
};

//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------


/**
 * TODO
 * @param {*} hidePage 
 * @param {*} showPage 
 */
function switchPage(hidePage, showPage) { //Changes display attribute of elements.
    hidePage.style.display = "none";
    showPage.style.display = "inline";
}


//TODO bør nok omskrives til individuelle funktioner. der er alligevel intet overlap mellem cases
function retrieveElementInformationCSS(X, answer) { //Defines variables for useage in switchPage and for insertion of password and username
    switch (X) {
        case "retrievePassword":
            let username = document.getElementById("SignedIn-username");
            let password = document.getElementById("SignedIn-password");
            let button = document.getElementById("SignedIn-submit"); //button
            let page = document.getElementById("SignedIn2"); //SignedInPage
            let logoutButton = document.getElementById("LogoutButton");
            let settingsButton = document.getElementById("Settings");

            settingsButton.style.display = "none";
            logoutButton.style.display = "none";
            document.getElementById("SignedIn-website").style.display = "none"; //Hides the add new login button
            username.innerHTML = answer.username; //inserts the username in the relevant paragraph.
            password.innerHTML = answer.password; //inserts the passwords in the relevant paragraph.

            switchPage(button, page); //Changes display attribute of elements.
            break;
        case "SignIn":
            let hidePage = document.getElementById("LogIn");
            let showPage = document.getElementById("SignedIn");
            let settingsButton2 = document.getElementById("Settings");
            settingsButton2.style.top = "160px";
            settingsButton2.style.left = "110px";
            settingsButton2.style.padding = "5px";
            settingsButton2.style.paddingBottom = "4px";
            switchPage(hidePage, showPage); //Changes display attribute of elements.
            break;
        case "Error":
            let button2 = document.getElementById("SignedIn-submit"); //button
            let errorMessage = document.getElementById("error");
            let logoutButton2 = document.getElementById("LogoutButton");
            let settingsButton3 = document.getElementById("Settings");

            logoutButton2.style.display = "none";
            settingsButton3.style.display = "none";

            switchPage(button2, errorMessage);
            break;
        default:
            console.log("Something went wrong!")
            break;
    }
}

function incorrectInfoCSS() {
    let fieldUsername = document.getElementById("LogIn-username");
    let fieldPassword = document.getElementById("LogIn-password");
    let messageP = document.getElementById("LogIn-paragraph");

    fieldUsername.style.borderColor = "red";
    fieldPassword.style.borderColor = "red";
    messageP.style.display = "inline";
}

function clearToken() { //Logout function: reset the token to null

    chrome.runtime.sendMessage({ token: null }, function(response) { //Sets the token to null (logged out)
        if (response.success == true) {
            let signedInPage = document.getElementById("SignedIn");
            let logoutPage = document.getElementById("Logout");
            let settingsButton = document.getElementById("Settings");

            settingsButton.style.display = "none";
            switchPage(signedInPage, logoutPage); //Hides the signed-in page and shows logout 
        } else {
            console.log("*An error has occured*"); //Error message if the response is false.
        }
    });

    
    
}