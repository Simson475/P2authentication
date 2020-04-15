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
        /*i tilfælde af tidligere ikke matchende password (resetter)*/
        document.body.style.height = "250px";
        document.getElementById("create").style.top = "225px";
        document.getElementById("return").style.top = "225px";
        document.getElementById("firstPassword").style.borderColor = "#101010";
        document.getElementById("secondPassword").style.borderColor = "#101010";
        document.getElementById("wrongPassword").style.display = "none";
        /*generere peber streng*/
        let pepperString = cryptoRandomString({length: 20, type: 'base64'});
        console.log(pepperString);
        /*konkatinere indtastet password med den pebrede streng*/
        let pepperPassword = form.password1.value + pepperString;
        let hashedPassword = hashing(pepperPassword);


        let jsondata = {
            username: form.username.value,
            password: hashedPassword 
        };
        

        let answer = await fetch("http://127.0.0.1:3000/newUser", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsondata, null, 2)
        });

        answer = await answer.json()


        if (answer) {
            //Gemmer den generede peberstreng i localstorage (er usikker på præcist hvor det er)
            chrome.storage.local.set({key: pepperString}, function() {
                console.log('Saved pepperString: ' + pepperString);
              });
            //Funktionen som henter den gemte peber streng fra local storage.
              chrome.storage.local.get(['key'], function(result) {
                console.log('Loaded pepperString: ' + result.key);
              });
    
        } else { //hvis brugernavnet allerede eksi
            /*gør bodyen større så der er plads til et label mere, flytter knapperne ned, skifter border farver på password felterne og viser besked*/
            document.body.style.height = "280px";
            document.getElementById("create").style.top = "250px";
            document.getElementById("return").style.top = "250px";
            document.getElementById("username").style.borderColor = "#BA1919";
            document.getElementById("inUse").style.display = "inline";
        }

        form.reset();
    } else { //hvis passwordsene er ens
        /*i tilfælde af at der tidligere er indtastet et eksisterende bruger navn (resetter)*/
        document.getElementById("username").style.borderColor = "#101010";
        document.body.style.height = "280px";
        document.getElementById("create").style.top = "250px";
        document.getElementById("return").style.top = "250px";
        document.getElementById("inUse").style.display = "none";
        /*gør bodyen større så der er plads til et label mere, flytter knapperne ned, skifter border farver på password felterne og viser besked*/
        document.body.style.height = "280px";
        document.getElementById("create").style.top = "250px";
        document.getElementById("return").style.top = "250px";
        document.getElementById("firstPassword").style.borderColor = "#BA1919";
        document.getElementById("secondPassword").style.borderColor = "#BA1919";
        document.getElementById("wrongPassword").style.display = "inline";

    }
}

function hashing(str){ //stjålet fra nettet: http://mediocredeveloper.com/wp/?p=55
    let len = str.length;
    let hash = 0;
    for(let i = 1; i <= len; i++){
        let char = str.charCodeAt((i-1));
        hash += char*Math.pow(31,(len-i));
        hash = hash & hash; //javascript limitation to force to 32 bits
    }
    return Math.abs(hash);
}









