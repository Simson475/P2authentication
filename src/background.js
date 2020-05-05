let token = null; // makes sure to set token to NULL so that a user is not authenticated by default. 

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { // Listens for messages sent from other js files
    
    if (request.token !== undefined) {   // Checks if token is set
        token = request.token;
        console.log(request.token);
        sendResponse({ success: true }); // Sends response back with the object {Success: true}

        
    } else if (request.getToken === true) { // Check for request for token
        console.log("sending token");
        sendResponse({ token: token });     // Sends response back with the token.


    } else if (request.sendURL !== undefined) { // Checks if there is a message at request.sendURL
        let domain = request.sendURL;
        if (domain === undefined) {
            sendResponse({ fetchAnswer: "Message not received." }) // Answers the sender that domain was not readable.
        } else {
            asyncCode(domain, sendResponse); // Contacts server and requests username and password for the domain passed in the body

            return true; // Necessary for promise based fetch request
        }
    }

})

/**
 * asyncCode sends a Fetch request of type 'POST' to receive username and password.
 * @param domain contains the current URL for the active tab 
 * @param sendResponse callback function that will conatin the answer from the fetch request
 */
async function asyncCode(domain, sendResponse) {
    fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/getPassword", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "authorization": token
            },
            body: JSON.stringify({ domain: domain })
        })
        .then(async(answer) => {
            answer = await answer.json() //parses the response
            console.log(answer)
            console.log(domain)
            sendResponse({ fetchAnswer: answer });
        })
}