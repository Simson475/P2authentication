let token = null;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) { //Listens for messages sent
    //checks if token is set
    if (request.token !== undefined) {
        token = request.token;
        console.log(request.token);
        sendResponse({ success: true });

        //check for request for token
    } else if (request.getToken === true) {
        console.log("sending token");
        sendResponse({ token: token });
    } else if (request.cargo !== undefined) {
        let domain = request.cargo
        if (domain == undefined) {
            console.log("Alting er undefined");
            sendResponse({ returnCargo: "nejtak" })
        } else {
            //Contacts server and requests username and password for the domain passed in the body
            asyncCode(domain, sendResponse)
            return true;
        }
    }

})

/**
 * 
 * @param domain
 * @param sendResponse
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
            sendResponse({ returnCargo: answer });
        })
}