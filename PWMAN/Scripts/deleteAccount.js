document.getElementById("AuthDeleteButton").addEventListener("click", deleteAccount);
document.getElementById("deleteAccountButton").addEventListener("click", deleteLogin);

checkToken();

function checkToken(){
    chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function

        if (response.token === null){

            let deletePage = document.getElementById("deletePage");
            deletePage.style.display = "none";


        }else {

            let deleteForm = document.getElementById("deleteForm");
            deleteForm.style.display = "none";
        }
    });
}
            
    
function deleteAccount(event){
    event.preventDefault();
    console.log("lort");
    let form = document.getElementById("deletePageForm");
    console.log(form.AUTH.value);

    chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function

        if (response.token === null){
            console.log("Token was set to null - System error");
        }else {

            let form = document.getElementById("deletePageForm");

            if(form.AUTH.value === "DELETE"){
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

                if (answer.error != undefined){
                    //hvis der er en error
                    console.log("unauthorized")
                    
                }
                else{
                    clearToken();
                    deleteSuccesCSS();
                }
            }
            else {
                errorFunction();

            }
        
        }
        form.reset();
    });
}

function deleteLogin(event){
    event.preventDefault();
    

    let form = document.getElementById("deleteForm");  //Gets information from form and inserts in the object jsondata  

    chrome.storage.local.get([form.username.value], async function(result) { //The function to load the saved pepper string from the property username in local storage (idk from where).
        let form = document.getElementById("deleteForm"); //Gets information from form and inserts in the object jsondata       
        let pepperPass = form.password.value.concat(result[form.username.value]); //concatinates password with the loaded pepper
        let hashedPass = hashCode(pepperPass);

        let jsondata = { //An object containing the username and hashed password.
            username: form.username.value,
            password: hashedPass,
            domain: location
        };

        let answer = await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/validate", { //Contacts the serveren with username and password to log in.
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsondata, null, 2)
        });

        answer = await answer.json(); //parses the response

        if (answer.error != undefined){ //Checks if the answer is a error message
            console.log(answer);
            console.log("server sendte error"); //Displays an error message in case the entered username or password is wrong.
            
        
        }else {
            chrome.runtime.sendMessage({ token: "bearer " + answer.token }, function(response) { //saves the token to backgroundscript
                console.log("Bearer token successfully saved");
                if (response.success == true) {
                    logInCss();  
                } else {
                    console.log("*An error has occured*"); //Error message if the response is false.
                }
            });
        }
        form.reset();
    })
}

//----Subfunctions--------------------------------------------------
function hashCode(str) { //stolen from the internet
    return str.split('').reduce((prevHash, currVal) =>
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

function deleteSuccesCSS(){
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

function errorFunction(){
    console.log("error")

    let delInput = document.getElementById("AuthDelete");
    delInput.style.borderColor = "Red";

}

function logInCss(){
    let deleteForm = document.getElementById("deleteForm");
    let loginSucces =  document.getElementById("loginSucces");
    let returnButton = document.getElementById("ReturnSettings");
    loginSucces.style.display = "inline";
    deleteForm.style.display = "none";
    returnButton.innerHTML = "Settings";
    returnButton.style.position = "absolute";
    returnButton.style.top = "120px";
    returnButton.style.fontSize = "1.3em";
    returnButton.style.padding = "10px 20px 10px 20px";
    returnButton.style.marginLeft = "40px";    

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


