let token = null; // makes sure to set token to NULL so that a user is not authenticated by default. 
const { postRequest } = require("./util.js")
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { // Listens for messages sent from other js files

    if (request.token !== undefined) { // Checks if token is set
        token = request.token;
        console.log(request.token);
        sendResponse({ success: true }); // Sends response back with the object {Success: true}


    } else if (request.getToken === true) { // Check for request for token
        console.log("sending token");
        sendResponse({ token: token }); // Sends response back with the token.


    } else if (request.sendURL !== undefined) { // Checks if there is a message at request.sendURL
        let domain = request.sendURL;
        if (domain === undefined) {
            sendResponse({ fetchAnswer: "Message not received." }) // Answers the sender that domain was not readable.
        } else {
            fetchUser(domain, sendResponse); // Contacts server and requests username and password for the domain passed in the body

            return true; // Necessary for promise based fetch request
        }
    }

})

/**
 * fetchUser sends a Fetch request of type 'POST' to receive username and password.
 * @param domain contains the current URL for the active tab 
 * @param sendResponse callback function that will conatin the answer from the fetch request
 */
async function fetchUser(domain, sendResponse) {
    postRequest("getPassword", { domain: domain }, token)
        .then(async(answer) => {
            answer = await answer.json() // Parses the response
            sendResponse({ fetchAnswer: answer });
        })
}