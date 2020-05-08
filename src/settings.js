chrome.runtime.sendMessage({ getToken: true }, async function(response) { //gets token from background script. whatever is done with it should be done in this callback function
    if (response.token === null) notloggedInMenu();
    else loggedInMenu();
});


/**
 * Changes the style of the DOM if the user is logged in
 */
function loggedInMenu() {
    document.getElementById("menu").style.display = "inline";
    let importButton = document.getElementById("importButton");
    let exportButton = document.getElementById("exportButton");
    let deleteButton = document.getElementById("deleteButton");

    // Changes button placement
    importButton.style.padding = "5px"
    importButton.style.paddingLeft = "27px"
    importButton.style.paddingRight = "27px"

    // Changes button placement
    exportButton.style.top = "115px"
    exportButton.style.padding = "5px"
    exportButton.style.paddingLeft = "27px"
    exportButton.style.paddingRight = "27px"

    // Changes button placement
    deleteButton.style.top = "155px"
    deleteButton.style.padding = "5px"
    deleteButton.style.paddingLeft = "27px"
    deleteButton.style.paddingRight = "27px"
}


/**
 * Changes the style of the DOM if the user is not logged in
 */
function notloggedInMenu() {
    document.getElementById("menu").style.display = "inline";
    document.getElementById("exportButton").style.backgroundColor = "grey";
    document.getElementById("deleteButton").style.backgroundColor = "grey";
    document.getElementById("loggedOutParagraph").style.display = "inline";
}