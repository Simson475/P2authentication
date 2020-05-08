let token = null; // Makes sure to set token to NULL so that a user is not authenticated by default. 
const { postRequest } = require("./util.js")

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { // Listens for messages sent from other js files

    if (request.token !== undefined) { // Checks if token is set
        token = request.token; // Saves token in background script
        sendResponse({ success: true }); // Sends response back with the object {Success: true}

    } else if (request.getToken !== undefined) { // Check for request for token
        sendResponse({ token: token }); // Sends response back with the token.

    } else if (request.sendURL !== undefined) { // Checks if there is a message at request.sendURL
        fetchUser(request.sendURL, sendResponse); // Contacts server and requests username and password for the domain passed in the body
        return true; // Necessary for promise based fetch request 
    }
})

/**
 * fetchUser sends a Fetch request of type 'POST' to receive username and password for the given domain name
 * @param domain contains the current URL for the active tab 
 * @param sendResponse callback function that will conatin the answer from the fetch request
 */
async function fetchUser(domain, sendResponse) {
    postRequest("getPassword", { domain: domain }, token) // Contacts API on 'getpassword', expects to receive an answer with users credentials
        .then(async(answer) => {
            answer = await answer.json() // Parses the response
            sendResponse({ fetchAnswer: answer }); // Sends users credentials back to content.js
        })
}