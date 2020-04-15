//Event Listeners
document.querySelector("form").addEventListener("submit", formSubmit);

chrome.runtime.sendMessage({ getToken: true }, function(response) {

    //gets token from background script. whatever is done with it should be done in this callback function

    console.log(response);
    if (response.token === null) return;
    else {
        //TODO REDIRECT USER
    }
});

/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function formSubmit(event) {
    event.preventDefault();


    chrome.tabs.query({ active: true }, async function(tabs) { //finder hvilken tab det hele bliver kaldt i. bør omfaktoreres 
        let location = tabs[0].url;
        let form = document.getElementById("form"); //skaffer info fra form og indsætter i jsondata
        let jsondata = {
            username: form.username.value,
            password: form.password.value,
            domain: location
        };

        let answer = await fetch("http://127.0.0.1:3000/validate", { //kontakter serveren med username og password for at kunne logge ind.
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsondata, null, 2)
        });

        answer = await answer.json(); //parser responsen
        console.log(answer.token); /*Skal fjernes på et tidspunkt*/


        if (answer == "no user with given credentials") { //giver error message
            /* TODO
            STUB 
            her indsættes error message om bruger ikke eksister eller forkert login oplysning
            */

        } else {

            chrome.runtime.sendMessage({ token: "bearer " + answer.token }, function(response) {
                //saves the token to backgroundscript
                console.log("Bearer token successfully saved");
                //TODOcheck if response.success==true. hvis den gør det. redirect. ellers error message.
                //TODO redirect user.
            });


        }
        form.reset();
    });
}

//let newAnswer = await fetch("http://127.0.0.1:3000/test", { //sender test til server for at se om JWT er korrekt signed. bør fjernes at some point.
//    method: 'POST',
//    headers: {
//        'Content-Type': 'application/json',
//        "authorization": "bearer " + answer.token
//    },
//    body: JSON.stringify(jsondata, null, 2)
//});

//newAnswer = await newAnswer.json();
//console.log(newAnswer);