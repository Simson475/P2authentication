document.getElementById("AuthDeleteButton").addEventListener("click", deleteAccount);

chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function

    if (response.token === null) {
        let deletePage = document.getElementById("deletePage");
        deletePage.style.display = "none";
        document.getElementById("logInCheck").style.display = "inline";
        

    } else {
    }
});



function deleteAccount(event) {
    event.preventDefault();
    let form = document.getElementById("deletePageForm");

    chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function

        if (response.token === null) {
            console.log("Token was set to null - System error");
        } else {

            let form = document.getElementById("deletePageForm");

            if (form.AUTH.value === "DELETE") {
                //fetch req med token til severen (skal returnere username)
                let answer = await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/deleteAccount", { //Sends a fetch request to the server with the identifying token and the jsondata object
                    method: 'DELETE',
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": response.token
                    },
                });

                answer = await answer.json(); //parses the response

                console.log(answer);
                console.log(answer.error);

                if (answer.error != undefined) {
                    //hvis der er en error
                    console.log("unauthorized")

                } else {
                    clearToken();
                    deleteSuccesCSS();
                }
            } else {
                errorFunction();

            }

        }
        form.reset();
    });
}



//----Subfunctions--------------------------------------------------


function deleteSuccesCSS() {
    let deletePage = document.getElementById("deletePage");
    let message = document.getElementById("deletionMessage");
    let ReturnSettings = document.getElementById("ReturnSettings");
    let BackButton = document.getElementById("BackButton");

    BackButton.style.display = "inline";
    ReturnSettings.style.display = "none";

    deletePage.style.display = "none";
    message.innerHTML = "Your account has been deleted!";
    message.style.display = "inline";
}

function errorFunction() {

    let delInput = document.getElementById("AuthDelete");
    delInput.style.borderColor = "Red";
    console.log(`Did not write "DELETE" correctly`);
}

function clearToken() { //reset the token to null

    chrome.runtime.sendMessage({ token: null }, function(response) { //Sets the token to null (logged out)
        if (response.success == true) {
            console.log("token set to null");

        } else {
            console.log("*An error has occured*"); //Error message if the response is false.
        }
    });

}