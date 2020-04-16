let token = null;
chrome.runtime.onMessage.addListener(
    //Listens for messages sent
    function(request, sender, sendResponse) {
        //checks if token is set
        if (request.token !== undefined) {
            token = request.token;
            console.log(request.token);
            sendResponse({ success: true });

            //check for request for token
        } else if (request.getToken === true) {
            console.log("sending token");
            sendResponse({ token: token });
        }
    })