//Event Listeners
document.getElementById("submit").addEventListener("click", retrievePassword);
//const fs = require('fs');


async function retrievePassword(event) {
    console.log("User pressed the button.") //debugging ;-)
    event.preventDefault()
    let form = document.getElementById("form");
    form.style.visibility = "visible"; //Viser formen hvis man klikker Get Password.

    let answer = await fetch("http://127.0.0.1:3000/getPassword", { //kontakter serveren og beder om username og password for at kunne logge ind.
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "authorization": "bearer " + answer.token
            },
            body: { //Her skal den sende URL
            } 
    });
    await console.log(answer);
}   