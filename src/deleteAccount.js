document.getElementById("AuthDeleteButton").addEventListener("click", deleteAccount);

chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function
    if (response.token === null) {
        document.getElementById("deletePage").style.display = "none";
        document.getElementById("logInCheck").style.display = "inline";
    }
});


/**
 * Checks if the user is logged in.(it is required to bee logged in)
 * Checks if the user has inputted "DELETE"
 * Sends a delete request to the server 
 * @param {Object} event event is the trigger of the function. It is used to prevent default behaviour of the submit method in a form.
 */
function deleteAccount(event) {
    event.preventDefault();

    chrome.runtime.sendMessage({ getToken: true }, async function(response) { // Gets token from background script. whatever is done with it should be done in this callback function

        const form = document.getElementById("deletePageForm");

        if (form.AUTH.value === "DELETE") {
            // Fetch req med token til severen (skal returnere username)
            let answer = await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/deleteAccount", { // Sends a fetch request to the server with the identifying token and the jsondata object
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": response.token
                },
            });
            answer = await answer.json(); // Parses the response

            if (answer.error != undefined) { // If there is an error
                console.log("unauthorized")
                console.log(answer.error)

            } else { // If no errors
                chrome.runtime.sendMessage({ token: null }); //Sets token to null (logs user out)
                deleteSuccessCSS(); // Renders the 'deletion succesful' CSS
            }

        } else document.getElementById("AuthDelete").style.borderColor = "Red"; // if user does not write DELETE correctly, shows the field as red

        form.reset();
    });
}

//-----------------------------------------------------Subfunctions()-----------------------------------------------------


/**
 * Sets the style of the DOM when an account is successfully deleted.
 */
function deleteSuccessCSS() {
    // Hides elements
    document.getElementById("deletePage").style.display = "none";
    document.getElementById("ReturnSettings").style.display = "none";

    // Renders elements
    document.getElementById("BackButton").style.display = "inline";
    let message = document.getElementById("deletionMessage");
    message.style.display = "inline";
    message.innerHTML = "Your account has been deleted!";
}