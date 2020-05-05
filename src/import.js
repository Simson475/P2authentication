let form = document.getElementById("importForm");
form.addEventListener("submit", importFunction);
document.getElementById("answerYes").addEventListener("click", overwrite);


async function importFunction(event) {
    event.preventDefault();
    let form = document.getElementById("importForm");

    let username = form.username.value;

    chrome.storage.local.get([username], async function(result) {
    
        let form = document.getElementById("importForm");

        let username = form.username.value;
        let pepperString = form.pepper.value;

        if (form.pepper.value.length !== 20){
            document.getElementById("pepperMessage").style.display = "inline";
            document.getElementById("importPepper").style.borderColor = "red";
        }

        else if (result[username] != null) { //denne brugers pepperstring er allerede gemt.
            let warning = document.getElementById("importWarning");
            let importPage = document.getElementById("importForm");
            let returnButton = document.getElementById("returnSettings");
            document.getElementById("importSuccess").style.display = "none";
            returnButton.style.display = "none";
            importPage.style.display = "none";
            warning.style.display = "inline";
            document.getElementById("pepperMessage").style.display = "none";
            
        } else {

            chrome.storage.local.set({[username]: pepperString}, function() {
                console.log("Pepper has been added");
                document.getElementById("importSuccess").style.display = "inline";
            });
            

        }
        form.reset();
    });
}

function overwrite() {

    let form = document.getElementById("importForm");
    let username = form.username.value;
    let pepperString = form.pepper.value;

    chrome.storage.local.set({[username]: pepperString}, function() {
        pepperImportedCSS();
        console.log("pepper has been overwritten");
    });


}

//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------

function importSuccesCSS() {
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

function pepperImportedCSS() {
    document.getElementById("importSuccess").style.display = "inline";
    document.getElementById("answerYes").style.display = "none";
    document.getElementById("answerNo").style.display = "none";
    document.getElementById("returnSettings").style.display = "inline";
}