
chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function

    if (response.token === null) {
        notloggedInMenu();

    } else {
        loggedInMenu();
    }
});

function loggedInMenu(){
    let menu = document.getElementById("menu");
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

