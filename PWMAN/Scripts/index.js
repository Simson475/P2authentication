//Event Listeners
document.querySelector("form").addEventListener("submit", formSubmit);

chrome.runtime.sendMessage({ getToken: true }, function(response) {

    //gets token from background script. whatever is done with it should be done in this callback function

    console.log(response);
    if (response.token === null) return;
    else {
        //redirects til LoggedIn.html
        window.location.href = '../HTML/LoggedIn.html';
    }
});

/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function formSubmit(event) {
    event.preventDefault();

        let form = document.getElementById("form"); //skaffer info fra form og indsætter i jsondata
        console.log(form.username.value);
       
        //Funktionen som henter den gemte peber streng fra local storage.
        
        /*let pepper = chrome.storage.local.get(['key'], function(result) {
            let noget = JSON.stringify(result.key);
            return noget;
        });*/
        chrome.storage.local.get(['key'], async function(result) {
            
            let form = document.getElementById("form"); //skaffer info fra form og indsætter i jsondata
            let username = form.username.value;
            console.log(username);
            let pepperPass = form.password.value + result.key;
            let hashedPass = hashing(pepperPass);
            console.log("key: "+ result.key);
            console.log("med peber: " + pepperPass);
            console.log("hashed: " + hashedPass);
            
            let jsondata = {
                username: form.username.value,
                password: hashedPass,
                domain: location
            };
            console.log(jsondata);

            let answer = await fetch("http://127.0.0.1:3000/validate", { //kontakter serveren med username og password for at kunne logge ind.
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jsondata, null, 2)
            });

            answer = await answer.json(); //parser responsen
            console.log(answer); /*Skal fjernes på et tidspunkt*/


            if (answer == "no user with given credentials") { //giver error message
                /* TODO
                STUB 
                her indsættes error message om bruger ikke eksister eller forkert login oplysning
                */

            } else {

                chrome.runtime.sendMessage({ token: "bearer " + answer.token }, function(response) {
                    //saves the token to backgroundscript
                    console.log("Bearer token successfully saved");
                    if (response.success == true){ //Checker om response er true                        
                        window.location.href = '../HTML/LoggedIn.html'; //redirects til LoggedIn.html
                    }
                    else{
                        console.log("*An error has occured*"); //Error message hvis response er false
                    }
                });
                    
                    

            }
            form.reset();
        })

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
function hashing(str){ //stjålet fra nettet: http://mediocredeveloper.com/wp/?p=55
    len = str.length;
    hash = 0;
    for(i=1; i<=len; i++){
        char = str.charCodeAt((i-1));
        hash += char*Math.pow(31,(len-i));
        hash = hash & hash; //javascript limitation to force to 32 bits
    }
    return Math.abs(hash);
}