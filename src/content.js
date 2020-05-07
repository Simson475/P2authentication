let domainURL = location.href // Gets the URL from the current page
chrome.runtime.sendMessage({ getToken: true }, async function(response) { // Checks whether or not a session based authentication cookie is set.
    if (response.token === null) { // If null, not currently logged in
        console.log("Not currently logged in")
        return;
    } else if (response.token === undefined) { // Token is undefined so something went wrong
        //STUB ERROR HANDLING
        console.log("response.token is undefined");
        return;
    } else {
        window.onload = () => { // Waits for the page to be fully loaded to execute the autofill process.
            chrome.runtime.sendMessage({ sendURL: domainURL }, (response) => { // Sends a message to background containing the current URL.
                if (response.fetchAnswer.error === undefined) autofill(response.fetchAnswer.username, response.fetchAnswer.password); // Autofills the web page, with the saved username and password.
            })
        }
    }
})
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) { // Listens for a messages.
    if (request.autofillPassword !== undefined) { // Checks if message contains the field 'autofillPassword'

        const activeForm = parentForm(document.activeElement) // Finds the last active form - meant to find the sign up sheet.
        let passwords = findPasswordFieldInForm(activeForm) // Finds the password field.
        for (elem of passwords) {
            elem.value = request.autofillPassword; // inserts the user's password into the password field that has been found by findPasswordFieldInForm      
            elem.innerHTML = request.autofillPassword; // Overwrites the innerHTML of the password field to be the password.
        }
        await sendResponse({ autofillListenerResponse: true }) // calls callback function with value true.
    } else {
        console.log("Response from content.js failed.")
        await sendResponse({ autofillListenerResponse: false }) // calls callback function with value false    
            //TODO ERROR HANDLING
    }
})

/**
 * autofill detects and auto completes the form fields log-in and password with the appropriate information.
 * @param username this is the username for the account on the current domain. 
 * @param password This is the password generated for the user, min. 15 characters long.
 */
function autofill(username, password) { // Identifies the first input-field with type="password"
    let pswd = findPasswordField() // Returns an array of all fields with type="password"
    let fieldPairs = correctField(pswd) // An array with pairs of [UsernameField, PasswordField]
    fieldPairs[0].value = username; // Selects the username field of the first pair, and inputs the username
    fieldPairs[0].innerHTML = username; // Sets the value of the innerHTML to the username.
    fieldPairs[1].value = password; // Sets the value of the password field to be the users password.
    fieldPairs[1].innerHTML = password; // Sets the value of the innerHTML to the password.
    fieldPairs[0].style.background = "#FFB732"; // Changes the color of the username box
    fieldPairs[1].style.background = "#FFB732"; // Does the same with the password box
}


/**
 * parentForm identifies the closest element with the form, in which the selected element exists.
 * @param elem an node in the DOM of the current Website
 */
function parentForm(elem) {
    while (elem.parentNode) {
        if (elem.parentNode.nodeName.toLowerCase() === 'form') { // Checks whether or not a nodes parent is named 'form'
            return elem.parentNode; // Returns the parent node
        }
        elem = elem.parentNode; // If not found continue traversing the DOM-tree upwards.
    }
    return false;
};


/**
 * Finds input fields of the type password and saves them in an array.
 */
function findPasswordField() {
    let inputs = document.getElementsByTagName('input'), // Creates an array of all input fields in the DOM
        len = inputs.length, // The length of the array of input fields
        passwordFieldArray = []; // Initialises an array
    while (len !== 0) { // Checks the array of input-fields starting from the last.
        if (inputs[len - 1].type === 'password') { // If the input-field is a type="password" it is added to the array passwordFieldArray.
            passwordFieldArray[passwordFieldArray.length] = inputs[len - 1]; // Inserts the current field into the passwordFieldArray.
        }
        len--
    }
    return passwordFieldArray; // Returns an array of all fields of type="password".
}


/**
 * Makes pairs of password input fields and username/email input fields into an array.
 * @param passwordFieldArray an array of all input fields of the type "password" that is in the current HTML of the website.
 */
function correctField(passwordFieldArray) {
    let pswdLength = passwordFieldArray.length;
    while (pswdLength !== 0) { // Checks all elements in the array passwordFieldArray starting from the last.
        let curPswdField = passwordFieldArray[pswdLength - 1] // Selects the current password field to examine.
        let curParentForm = parentForm(curPswdField); // Assigns the current 'form' of current password field to a variable.

        if (curParentForm) { // Checks if a 'form' exists.
            let inputs = curParentForm.getElementsByTagName('input'); // Creates an array of all input-fields in the current 'form'.
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i] !== curPswdField && (inputs[i].type === 'email' || inputs[i].type === 'text')) { // If the field examined, isn't the current password field and is of the type "text" or "email".
                    return [inputs[i], curPswdField]; // Returns an array of pairs of username- and password fields.
                }
            }
        }
        pswdLength--
    }
}

/**
 * Finds the input field with the type 'password' in the given form.
 * @param form an element with the class 'form' in the DOM.
 */
function findPasswordFieldInForm(form) {
    let inputFields = form.getElementsByTagName('input'); // Makes an array of all input fields in the form. 
    let passwordFields = []
    for (elem of inputFields) {
        if (elem.type === "password") passwordFields.push(elem) // If an element with the type "password" is found then, it returns that element. 
    }
    console.log(passwordFields)
    return passwordFields; // if no elements with the type password can be found in the form it returns false
}