const { postRequest } = require("./util.js")

chrome.runtime.sendMessage({ getToken: true }, async function(response) { // Gets token from background script. whatever is done with it should be done in this callback function

    if (response.token === null) document.getElementById("loginFail").style.display = "inline"; // Renders CSS for failed login attempt.
    else {
        let answer = await postRequest("/confirmUsername", undefined, response.token); // Fetch req med token til serveren (skal returnere username)
        answer = await answer.json(); // Parses the response

        if (answer.error === undefined) { // If no errors
            chrome.storage.local.get([answer.username], function(result) { // Exports pepper for the user who is logged in
                exportSuccesCSS(result[answer.username]) // Renders CSS for succesful export of pepper, also shows pepper
            });
        } else console.log(answer.error)
    }
});


/**
 * Sets the style of the DOM when an account is exported correctly.
 * Displays the pepperstring in paragraph
 * @param {String} result Contains the pepper string
 */
function exportSuccesCSS(result) {
    let paragraph = document.getElementById("Pepper");
    paragraph.innerHTML = result; // Puts the pepperstring in the paragraph
    paragraph.style.display = "inline";

    document.getElementById("PepperLabel").style.display = "inline";
}