//Event Listeners
document.getElementById("submit").addEventListener("click", retrievePassword);
//const fs = require('fs');



async function retrievePassword(event) {
    event.preventDefault()
    chrome.runtime.sendMessage({ getToken: true }, function(response) {

    //gets token from background script. whatever is done with it should be done in this callback function

    console.log(response);
    if (response.token === null) return;
    else if (response.token === undefined) {
        //STUB ERROR HANDLING
        return;
    }
    else {
        console.log("User pressed the button.") //debugging ;-)
        let form = document.getElementById("form");
        form.style.visibility = "visible"; //Viser formen hvis man klikker Get Password.

        let answer = await fetch("http://127.0.0.1:3000/getPassword", { //kontakter serveren og beder om username og password for at kunne logge ind.
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "authorization": "bearer " + response.token
            },
            body: { //Her skal den sende URL
                "domain": "https://twitter.com"
            } 
        });
    console.log(answer); 
    }
    });
}   