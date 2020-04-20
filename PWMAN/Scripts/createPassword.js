document.querySelector("form").addEventListener("submit", addAccount)

/* const cryptoRandomString = require('crypto-random-string'); */
async function addAccount(event){
    event.preventDefault()
    let form = document.getElementById("form");
    console.log("username: " + form.username.value)
    chrome.runtime.sendMessage({ getToken: true }, async function(response) {
        console.log(response);
        console.log("username: " + form.username.value)
        if (response.token === null) {
            return;
        }
        else if (response.token === undefined) {
            //STUB ERROR HANDLING
            console.log("response.token is undefined")
            return;
        } else {
            chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
                // since only one tab should be active and in the current window at once
                // the return variable should only have one entry
                let form = document.getElementById("form"); //skaffer info fra form og indsætter i jsondata
                let activeTab = tabs[0];    
                let location = activeTab.url;
                
                console.log(activeTab.url);

                let username2 = form.username.value;
                console.log(username2);
                let jsondata = {
                    username: form.username.value,
                    password: generatePassword(),
                    domain: location
                };
                console.log(jsondata);
        
                let answer = await fetch("http://127.0.0.1:3000/updateInfo", { //sender brugernavn, password og domæne til serveren.
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": response.token
                    },
                    body: JSON.stringify(jsondata, null, 2)
                });
                answer = await answer.json()
                console.log(answer);
                if (answer == true){
                    console.log("Account added");
                    let message = document.getElementById("h3");
                    let Form = document.getElementById("form");
                    Form.style.display = "none";
                    message.innerHTML = "Login Added";
                    let returnButton = document.getElementById("return")
                    returnButton.innerHTML = "Go back"
                    returnButton.style.top = "100px"
                    returnButton.style.left ="40px " 
                    returnButton.style.fontSize = "1.3em";
                    returnButton.style.padding = "10px 20px 10px 20px"
                    returnButton.style.marginLeft = "18px" //virker dette skal der laves css og html som fortæller brugeren der er oprettet.
                    
                }
                else{
                    let message = document.getElementById("h3");
                    message.innerHTML = "Error - account not added";
                    message.style.display = "inline"; //viser error message
                    
                }
                form.reset();
            })   
        }  
    })
}

function generatePassword() {
    let password = [], str = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'O', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];
    for (let i = 0; i < 15; i++) {
        password[i] = str[Math.floor(Math.random() * 61)];
        console.log(password[i])
    }
    return password.join('');
}

function printsURL() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        // since only one tab should be active and in the current window at once
        // the return variable should only have one entry
        let activeTab = tabs[0];    
        let location = activeTab.url;
        location = location.split("");
        location = location.slice(8, ).join('');
        document.getElementById("URLgoesHere").innerHTML = location;
    })
}
printsURL();