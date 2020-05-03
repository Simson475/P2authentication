document.getElementById("AutofillPassword").addEventListener("click", passwordAutofill); //adds an event listener to the autofill in the html.
let currentPassword = null;
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
                    password: currentPassword, 
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
/**
 * TODO
 */
function passwordAutofill() {

    document.getElementById("AutofillPassword").removeEventListener("click", passwordAutofill); //removes an event listener to the autofill in the html.
    document.getElementById("website").style.display = "inline"                                 //gives the submit button on the extension the type=submit.
    document.querySelector("form").addEventListener("submit", addAccount);                      //adds an event listener to the submit-button in the html.

    chrome.runtime.sendMessage({ getToken: true }, async function(response) {
        if (response.token === undefined || response.token === null) {
            // TODO STUB ERROR HANDLING
            console.log("response.token is undefined");
            return;

        } else {
           currentPassword = generatePassword();
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
                await chrome.tabs.sendMessage(tabs[0].id, { autofillPassword: currentPassword }, function(response) {

                    console.log(response.autofillListenerResponse);
                    if (response.autofillListenerResponse == true){
                        // successful communication with content.js
                        console.log("response succesful")
                    }
                    else if (response.autofillListenerResponse== false){
                        console.log("Response from content.js failed");
                    }
                    else {
                        //VERY BIG ERROR should never end here
                    }
                });
            });
        }
    });
};
//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------


//TODO change password generator so it for sure includes 1 capital letter and one number. (required by most sites)
/**
 * TODO
 */
function generatePassword() { // Generates a random string of a length between 15 to 20 characters by using math.random to choose a random character in an array of all the characters that we allow to be used in a password.
    let password = [],
        str = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'O', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
    let passLength = Math.floor(Math.random() * 5) + 15; //the constant 15 is arbitrarily chosen as the minimum length for the password, Math.random * 5 varies the password length by up to 5 characters.
    for (let i = 0; i < passLength; i++) {
        password[i] = str[Math.floor(Math.random() * 61)]; //Selects the i'th position in password to be a pseudorandom number in the 61 character long string 'str'
    }
    return password.join(''); //Joins together the array 'password' into a string.
}

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

    errorPage.style.display = "inline";

    message.innerHTML = err;

}