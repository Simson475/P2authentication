let form = document.getElementById("importForm");
form.addEventListener("submit", importFunction);

/**
 * checks if a pepperstring inputted into a form is a valid pepperstring.
 * And then save the pepper to local storage to match the username. 
 * @param {Object} event event is the event that triggers the function. It is used to prevent default behaviour of the submit method in a form. 
 */

async function importFunction(event) {
    event.preventDefault(); // prevents the normal run of a submit button
    let form = document.getElementById("importForm");
    let username = form.username.value;
    chrome.storage.local.get([username], async function(result) { //loads the pepper string for the username
    
        let form = document.getElementById("importForm");
        let pepperString = form.pepper.value;

        if (form.pepper.value.length !== 20){ //checks if the pepper is 20 characters long
            document.getElementById("pepperMessage").style.display = "inline"; //Display pepper requirements
            document.getElementById("importPepper").style.borderColor = "red"; //Changes the pepper input bordercolor to red 
        }

        else if (result[username] != null) { // Checks if the account already has a Pepperstring saved.
            let warning = document.getElementById("importWarning");
            let importPage = document.getElementById("importForm");
            let returnButton = document.getElementById("returnSettings");

            document.getElementById("importSuccess").style.display = "none"; // hides the import succes message (in case earlier succes)
            returnButton.style.display = "none"; // Hides the return button
            importPage.style.display = "none"; // Hides the input fields
            warning.style.display = "inline"; // shows the warning message, yes and no buttons
            document.getElementById("pepperMessage").style.display = "none"; // hides the pepper requirements message

            await document.getElementById("answerYes").addEventListener("click", function(){
                savePepper(pepperString, username, "overwrite"); // overwrite the existing pepper, when the user confirms they want to
            });
        } else {
                savePepper(pepperString, username, "save");
            }
        form.reset(); //resets the form
    });
}
/** 
 * saves the pepperstring in local storage
 * @param {String} pepperString contains the current pepperstring that the user wants to overwrite the old pepperstring with.
 * @param {String} username contains the username for the account that is being imported.
 */
function savePepper(pepperString, username, CSS) { 
    chrome.storage.local.set({[username]: pepperString}, function() {
        
        if (CSS === "save"){
            document.getElementById("importSuccess").style.display = "inline"; // display succes message
            console.log("Local storage has been added for '" + username +"'.");
        }
        else if (CSS === "overwrite"){
            pepperImportedCSS();
            console.log("Local storage for '" + username + "' has been overwritten.");
        }
        
    });
}

//---------Subfunctions---------------------------------------------------------------------------------------------------------------------------------

/**
 * Changes the style of the DOM when the user clicks yes about overwriting pepper. 
 * Runs inside of the function "savePepper".
 */
function pepperImportedCSS() {
    document.getElementById("importSuccess").style.display = "inline";
    document.getElementById("answerYes").style.display = "none";
    document.getElementById("answerNo").style.display = "none";
    document.getElementById("returnSettings").style.display = "inline";
}