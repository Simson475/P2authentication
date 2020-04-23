//Event Listeners
document.querySelector("form").addEventListener("submit", formSubmit)
const cryptoRandomString = require('crypto-random-string');
const fs = require('fs');

/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function formSubmit(event) {
    event.preventDefault()
    let form = document.getElementById("form");
    /*Compare passwords*/
    if (form.password1.value == form.password2.value) {

        let pepperString = cryptoRandomString({ length: 20, type: 'base64' }); //generates a pepper string
        let pepperPassword = form.password1.value.concat(pepperString); //concatinates the password with pepper
        let hashedPassword = hashCode(pepperPassword);

        let jsondata = { //An object containing the username and hashed password.
            username: form.username.value,
            password: hashedPassword
        };

        let answer = await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/newUser", { //Henter response for modifikation af database.
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsondata, null, 2)
        });

        answer = await answer.json()

        if (answer.error != undefined){ //Checks if the answer is a error message (In case the username is already in use on the database.)
            console.log(answer.error);
            document.getElementById("wrongPassword").style.display = "none";
            document.getElementById("firstPassword").style.borderColor = "#101010";
            document.getElementById("secondPassword").style.borderColor = "#101010";
            userExistCSS();
            
        
        }else{ //If there was no error message.
            chrome.storage.local.set({[jsondata.username]: pepperString }, function() { //Saves the generated pepper in the property of the username in local storage (idk where)
                savedUserCorrectCSS();
            });
        }

        form.reset();
    } else { //In case the passwords is not identical
        document.getElementById("inUse").style.display = "none";
        document.getElementById("username").style.borderColor = "#101010";

        passwordsNotIdenticalCSS();
        }
}

function hashCode(str) { //Stolen from the internet.
    return str.split('').reduce((prevHash, currVal) =>
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

function savedUserCorrectCSS() { //Changes the CSS settings for when the user is saved correct
    let returnButton = document.getElementById("return");
    document.getElementById("accountCreation").style.display = "none";
    document.getElementById("accountSuccess").style.display = "inline";
    returnButton.style.position = "relative";
    returnButton.style.top = "160px";
    returnButton.style.fontSize = "1.3em";
    returnButton.style.padding = "10px 20px 10px 20px";
    returnButton.style.marginLeft = "18px";
}

function userExistCSS() { // Changes the CSS in case that a user already exist.
    document.body.style.height = "280px";
    document.getElementById("create").style.top = "250px";
    document.getElementById("return").style.top = "250px";
    document.getElementById("username").style.borderColor = "#BA1919";
    document.getElementById("inUse").style.display = "inline";
}

function passwordsNotIdenticalCSS() { //Changes the CSS in case the password doesnt match.
    //Makes the body bigger, so there is room for a label, moves the buttons down, changes border colors on  the password fields and display the message.
    document.getElementById("username").style.borderColor = "#101010";
    document.body.style.height = "280px";
    document.getElementById("create").style.top = "250px";
    document.getElementById("return").style.top = "250px";
    document.getElementById("inUse").style.display = "none";
    document.getElementById("firstPassword").style.borderColor = "#BA1919";
    document.getElementById("secondPassword").style.borderColor = "#BA1919";
    document.getElementById("wrongPassword").style.display = "inline";
}