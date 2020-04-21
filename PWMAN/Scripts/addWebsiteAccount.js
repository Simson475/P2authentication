document.querySelector("form").addEventListener("submit", addAccount); //adds an event listener to the submit-button in the html.

async function addAccount(event){
    event.preventDefault();
    chrome.runtime.sendMessage({ getToken: true }, async function(response) {
        if (response.token === null) {
            return;
        }
        else if (response.token === undefined) {
            //STUB ERROR HANDLING
            console.log("response.token is undefined");
            return;
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                // since only one tab should be active and in the current window at once
                // the return variable should only have one entry
                let form = document.getElementById("form"); //defines the form from the html-document addWebsiteAccount.html
                let activeTab = tabs[0]; 
                let location = activeTab.url;

                let jsondata = { //This is the object that is sent to the server and saved in the json folder in the users dedicated databases JSON-file
                    username: form.username.value,
                    password: generatePassword(), //Calls a function that generates a password between 15-20 characters long.
                    domain: location
                };
        
                let answer = await fetch("http://127.0.0.1:3000/updateInfo", { //Sends a fetch request to the server with the identifying token and the jsondata object
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": response.token
                    },
                    body: JSON.stringify(jsondata, null, 2) //Makes sure that the object jsondata can be interpreted by the JSON-format
                });
                answer = await answer.json() //answer from the server

                if (answer == true){ //if the server responded with true, everything has been stored in the database. 
                    console.log("Account added");
                    successAccountCreationCSS();
                }
                else { //lets the user know that the account was NOT added successfully.
                    failedAccountCreationCSS();
                }
                form.reset();
            })   
        }  
    })
}
/**
 * generatePassword generates a random string of a length between 15 to 20 characters by using math.random 
 * to choose a random character in an array of all the characters that we allow to be used in a password. 
 */
function generatePassword() {
    let password = [], str = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'O', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
    let passLength = Math.floor(Math.random() * 5) + 15; //the constant 15 is arbitrarily chosen as the minimum length for the password, Math.random * 5 varies the password length by up to 5 characters.
    for (let i = 0; i < passLength; i++) {
        password[i] = str[Math.floor(Math.random() * 61)]; //Selects the i'th position in password to be a pseudorandom number in the 61 character long string 'str'
    }
    return password.join(''); //Joins together the array 'password' into a string.
}

/**
 * printsURL simply prints to the screen the URL of the current site for clarity in the account creation.
 */
function printsURL() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        let activeTab = tabs[0];    
        let location = activeTab.url;
        location = location.split("/"); //Splits the address up at the position of the slashes.
        location = location[2]; //Selects the part of the address with the domain name.
        document.getElementById("URLgoesHere").innerHTML = location; //Writes the address to the password manager window.
    })
}
printsURL();

/**
 * successAccountCreationCSS alters the styes of the page after a succesful creation.
 */
function successAccountCreationCSS(){
    let message = document.getElementById("h3");
    let form = document.getElementById("form");
    form.style.display = "none";
    message.innerHTML = "Login Added";
    let returnButton = document.getElementById("return");
    returnButton.innerHTML = "Go back";
    returnButton.style.top = "100px";
    returnButton.style.left ="40px "; 
    returnButton.style.fontSize = "1.3em";
    returnButton.style.padding = "10px 20px 10px 20px";
    returnButton.style.marginLeft = "18px";
    
}
/**
 * failedAccountCreationCSS alters the styes of the page after a failed creation.
 */
function failedAccountCreationCSS(){
    let message = document.getElementById("h3");
    message.innerHTML = "Error - account not added";
    message.style.display = "inline"; //viser error message
}
                    