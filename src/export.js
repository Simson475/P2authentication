const { postRequest } = require("./util.js")

chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function
    console.log(response);

    if (response.token === null) {
        notLoggedIn();

    } else {
    
        //fetch req med token til severen (skal returnere username)
        let answer = await postRequest("/confirmUsername", undefined, response.token);

        answer = await answer.json(); //parses the response

        console.log(answer);
        
        if (answer.error != undefined) {
            //hvis der er en error

        } else {

            chrome.storage.local.get([answer.username], function(result) {
                console.log(result[answer.username]);
                exportSuccesCSS(result[answer.username])
            });
        }
    }

});


function notLoggedIn() {
    let loginFail = document.getElementById("loginFail");
    loginFail.style.display = "inline";
    

}

function exportSuccesCSS(result) {
    let paragraph = document.getElementById("Pepper");
    let pepperLabel = document.getElementById("PepperLabel");
    pepperLabel.style.display = "inline";
    paragraph.innerHTML = result; //puts the pepperstring in the paragraph
    paragraph.style.display = "inline";
   

}