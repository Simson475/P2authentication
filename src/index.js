//Event Listeners
document.getElementById("LogIn-form").addEventListener("submit", formSubmit);
//document.getElementById("SignedIn-submit").addEventListener("click", retrievePassword);
document.getElementById("LogoutButton").addEventListener("click", clearToken);
const { hashCode, postRequest } = require("./util.js")
chrome.runtime.sendMessage({ getToken: true }, function(response) { //gets token from background script. whatever is done with it should be done in this callback function
    if (response.token === null) return;
    else signInCSS();
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
                    signInCSS(); 
                } else {
                    console.log("*An error has occured*"); //Error message if the response is false.
                }
            });
        }
        form.reset();
    })

}


//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------

/**
 * Hides a Css Div and shows another
 * @param {*} hidePage 
 * @param {*} showPage 
 */
function switchPage(hidePage, showPage) { //Changes display attribute of elements.
    hidePage.style.display = "none";
    showPage.style.display = "inline";
}


function signInCSS(){
    let hidePage = document.getElementById("LogIn");
    let showPage = document.getElementById("SignedIn");
    let settingsButton2 = document.getElementById("Settings");
    settingsButton2.style.top = "110px";
    settingsButton2.style.left = "58px";
    settingsButton2.style.padding = "5px";
    settingsButton2.style.paddingBottom = "4px";
    settingsButton2.style.paddingLeft = "27px";
    settingsButton2.style.paddingRight = "27px";
    switchPage(hidePage, showPage); 
}

function incorrectInfoCSS() { //Sets the CSS settings in case of incorrect input
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