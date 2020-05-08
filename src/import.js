document.getElementById("importForm").addEventListener("submit", importFunction);

/**
 * checks if a pepperstring inputted into a form is a valid pepperstring.
 * And then save the pepper to local storage to match the username. 
 * @param {Object} event event is the event that triggers the function. It is used to prevent default behaviour of the submit method in a form. 
 */
async function importFunction(event) {
    event.preventDefault(); // prevents the normal run of a submit button
    const form = document.getElementById("importForm");
    const username = form.username.value;

    chrome.storage.local.get([username], async function(result) { //loads the pepper string for the username

        const form = document.getElementById("importForm");
        const username = form.username.value;
        const pepperString = form.pepper.value;

        if (form.pepper.value.length !== 20) { //checks if the pepper is 20 characters long
            document.getElementById("pepperMessage").style.display = "inline"; //Display pepper requirements
            document.getElementById("importPepper").style.borderColor = "red"; //Changes the pepper input bordercolor to red 

        } else if (result[username] !== undefined) { // Checks if the account already has a Pepperstring saved.
            loadWarningCSS();
            document.getElementById("answerYes").addEventListener("click", function() { //adds event listener 
                savePepper(pepperString, username, "overwrite"); // overwrite the existing pepper, when the user confirms they want to
            });

        } else {
            savePepper(pepperString, username, "save");
        }
        form.reset(); //resets the form
    });
}


/** 
 * Saves the pepperstring in local storage
 * @param {String} pepperString contains the current pepperstring that the user wants to overwrite the old pepperstring with.
 * @param {String} username contains the username for the account that is being imported.
 */
function savePepper(pepperString, username, CSS) {
    chrome.storage.local.set({ // Stores the pepperstring in the users local storage.
        [username]: pepperString
    }, function() {
        if (CSS === "save") document.getElementById("importSuccess").style.display = "inline"; // Renders succes message
        else pepperImportedCSS(); // Renders pepper imported successfully message.
    });
}

//-------------------------------------------------Subfunctions()-------------------------------------------------

/**
 * Changes the style of the DOM when the user clicks yes about overwriting pepper. 
 * Runs inside of the function "savePepper".
 */
function pepperImportedCSS() {
    // Hides elements
    document.getElementById("answerYes").style.display = "none";
    document.getElementById("answerNo").style.display = "none";

    // Renders elements
    document.getElementById("importSuccess").style.display = "inline";
    document.getElementById("returnSettings").style.display = "inline";
}


/**
 * Loads warning page when trying to overwrite a saved pepper
 */
function loadWarningCSS() {
    // Hides elements
    document.getElementById("importForm").style.display = "none";
    document.getElementById("returnSettings").style.display = "none"; // Hides the return button
    document.getElementById("importSuccess").style.display = "none"; // Hides the import succes message (in case earlier succes)
    document.getElementById("pepperMessage").style.display = "none"; // Hides the pepper requirements message

    // Renders element
    document.getElementById("importWarning").style.display = "inline"; // Shows the warning message, yes and no buttons
}