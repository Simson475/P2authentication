
chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function

    if (response.token === null) {
        notloggedInMenu();

    } else {
        loggedInMenu();
    }
});

function loggedInMenu(){
    let menu = document.getElementById("menu");
    let importButton = document.getElementById("importButton");
    let exportButton = document.getElementById("exportButton");
    let deleteButton = document.getElementById("deleteButton");

    importButton.style.padding = "5px"
    importButton.style.paddingLeft = "27px"
    importButton.style.paddingRight = "27px"

    exportButton.style.top = "115px"
    exportButton.style.padding = "5px"
    exportButton.style.paddingLeft = "27px"
    exportButton.style.paddingRight = "27px"

    deleteButton.style.top = "155px"
    deleteButton.style.padding = "5px"
    deleteButton.style.paddingLeft = "27px"
    deleteButton.style.paddingRight = "27px"
    
    menu.style.display = "inline";

}

function notloggedInMenu(){
    
    let menu = document.getElementById("menu");
    let exportButton = document.getElementById("exportButton");
    let deleteButton = document.getElementById("deleteButton");
    let paragraph = document.getElementById("loggedOutParagraph");

    paragraph.style.display = "inline";
    exportButton.style.backgroundColor = "grey";
    deleteButton.style.backgroundColor = "grey";
    menu.style.display = "inline";
     
}

