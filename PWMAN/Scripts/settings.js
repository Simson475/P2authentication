document.getElementById("importButton").addEventListener("click", importPageCSS);
document.getElementById("importAccount").addEventListener("submit", importAccount);
document.getElementById("exportButton").addEventListener("click", exportAccount);
document.getElementById("exportAccountButton").addEventListener("click", exportAccountLogin);

document.getElementById("returnSettings").style.display ="none";

function importAccount(){

    let username = form.username.value;
    let pepperString = form.pepper;

    chrome.storage.local.get([username], async function(result) {

        if (result[username] != null){ //denne brugers pepperstring er allerede gemt.
            let warning  = document.getElementById("importWarning");
            importPage.style.display = "none";
            warning.style.display = "inline"


        }else{
            chrome.storage.local.set({[username]:pepperString}, function(){
                 document.getElementById("importSucces").style.display = "inline";
            })
        }
    });
}

function exportAccount(){

    let menu = document.getElementById("menu");
    let exportPage = document.getElementById("Export");
    let returnPop = document.getElementById("returnPop");
    let returnSettings = document.getElementById("returnSettings");
    
    returnPop.style.display ="none";
    returnSettings.style.display = "inline";
    menu.style.display ="none"; //hides the menupage
    exportPage.style.display = "inline";

    
    chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function

        if (response.token === null){

            let exportForm = document.getElementById("exportForm");
            exportForm.style.display = "inline";

        }else {
            
            //fetch req med token til severen (skal returnere username)
            let answer = await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/confirmUsername", { //Sends a fetch request to the server with the identifying token and the jsondata object
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "authorization": response.token
                }
            });
            
                    
            answer = await answer.json(); //parses the response

            console.log(answer.error);

            if (answer.error != undefined){
                //hvis der er en error
                  
            }
            else{
                
                chrome.storage.local.get([answer.username], function(result) {
                    console.log(result);
                    console.log(answer.username);
                    exportSuccesCSS(result, answer.username);
                });
            }
        }
        
    });

}

function exportAccountLogin(){
    event.preventDefault();

    let form = document.getElementById("exportForm");  //Gets information from form and inserts in the object jsondata  

    chrome.storage.local.get([form.username.value], async function(result) { //The function to load the saved pepper string from the property username in local storage (idk from where).
        let form = document.getElementById("exportForm"); //Gets information from form and inserts in the object jsondata       
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
            incorrectInfoCSS(); //Displays an error message in case the entered username or password is wrong.
            
        
        }else {
            chrome.runtime.sendMessage({ token: "bearer " + answer.token }, function(response) { //saves the token to backgroundscript
                console.log("Bearer token successfully saved");
                if (response.success == true) {
                    exportLoggedInCss();  
                } else {
                    console.log("*An error has occured*"); //Error message if the response is false.
                }
            });
        }
        form.reset();
    })





}
//------SubFuncktions--------------------------------------------------------------------------------------------------
function importPageCSS(){ //Funtion to show the import menu
    let menu = document.getElementById("menu");
    let importPage = document.getElementById("Import");
    let returnPop = document.getElementById("returnPop");
    let returnSettings = document.getElementById("returnSettings");
    returnSettings.style.display = "inline";
    returnPop.style.display = "none";
    menu.style.display ="none"; //hides the menupage
    importPage.style.display = "inline"; //show the import page
    
}

function exportLoggedInCss(){
    let exportForm = document.getElementById("exportForm");
    let loginSucces =  document.getElementById("loginSucces");
    let returnButton = document.getElementById("return");
    loginSucces.style.display = "inline";
    exportForm.style.display = "none";
    returnButton.innerHTML = "Settings";
    returnButton.style.position = "absolute";
    returnButton.style.top = "120px";
    returnButton.style.fontSize = "1.3em";
    returnButton.style.padding = "10px 20px 10px 20px";
    returnButton.style.marginLeft = "40px";    

}

function exportSuccesCSS(result, username){
    let paragraph = document.getElementById("exportPepper");
    let pepperLabel = document.getElementById("exportPepperLabel");
    let page = document.getElementById("Export");

    pepperLabel.style.display = "inline";
    paragraph.innerHTML = result[username]; //puts the pepperstring in the paragraph
    paragraph.style.display = "inline";
    page.style.display = "inline";  //shows the pepper.

}

function importSuccesCSS(){
    let returnButton = document.getElementById("return");
    let importParagraph = document.getElementById("importSucces");
    importParagraph.style.display = "inline";
    form.style.display = "none";
    returnButton.style.position = "relative";
    returnButton.style.top = "160px";
    returnButton.style.fontSize = "1.3em";
    returnButton.style.padding = "10px 20px 10px 20px";
    returnButton.style.marginLeft = "18px";  
    

}

function hashCode(str) { //stolen from the internet
    return str.split('').reduce((prevHash, currVal) =>
        (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0);
}

   
