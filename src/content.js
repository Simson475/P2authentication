const domainURL = location.href // Gets the URL from the current page 

chrome.runtime.sendMessage({ getToken: true }, async function(response) { // Checks whether or not a session based authentication cookie is set.
    if (response.token !== null && response.token !== undefined) { // token isnt null or undefined (eg. there is a usertoken)

        window.onload = () => { // Waits for the page to be fully loaded to execute the autofill process.

            chrome.runtime.sendMessage({ sendURL: domainURL }, (response) => { // Sends a message to background containing the current URL. Expects user credentials for curent domain 
                // Autofills the web page, with the saved username and password if no errors.
                if (response.fetchAnswer.error === undefined) autofill(response.fetchAnswer.username, response.fetchAnswer.password);
            })
        }
    }
})


chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) { // Listens for messages from add website account. used when autofilling.

    if (request.autofillPassword !== undefined) { // Checks if message contains the field 'autofillPassword'
        const activeForm = parentForm(document.activeElement) // Finds the last active form - meant to find the sign up sheet.
        const passwords = findPasswordFieldInForm(activeForm) // Finds the password fields and puts them in an array.

        for (elem of passwords) { //Iterates over all password-fields found in the active form.
            elem.value = request.autofillPassword; // Inserts the user's password into the password field.  
            elem.innerHTML = request.autofillPassword; // Overwrites the innerHTML of the password field to be the password.
            elem.style.background = "#FFB732" // Colors the password field orange
        }
        sendResponse({ autofillListenerResponse: true }) // calls callback function with value true.
    }
})

/**
 * autofill detects and auto completes the form fields log-in and password with the appropriate information.
 * @param username this is the username for the account on the current domain. 
 * @param password This is the password generated for the user, min. 15 characters long.
 */
function autofill(username, password) { // Identifies the first input-field with type="password"
    const passwordFields = findPasswordField() // Returns an array of all fields with type="password"
    let fieldPairs = findInputFieldPairs(passwordFields) // An array with pairs of [UsernameField, PasswordField]

    //inputTags into username field
    fieldPairs[0].value = username; // Selects the username field of the first pair, and inputTags the username
    fieldPairs[0].innerHTML = username; // Sets the value of the innerHTML to the username.
    fieldPairs[0].style.background = "#FFB732"; // Changes the color of the username box

    //inputTags into password field
    fieldPairs[1].value = password; // Selects the password field of the first pair, and inputTags the password
    fieldPairs[1].innerHTML = password; // Sets the value of the innerHTML to the password.
    fieldPairs[1].style.background = "#FFB732"; // Does the same with the password box

}


/**
 * parentForm identifies the first parent element with the form tag, in which the selected element exists.
 * @param elem an node in the DOM of the current Website
 */
function parentForm(elem) {
    while (elem.parentNode !== null) {
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
    const inputTags = document.getElementsByTagName('input'); // Creates an array of all input fields in the DOM
    let passwordFieldArray = []; // Initialises an array

    for (let i = inputTags.length; i > 0; i--) { // Checks the array of input-fields starting from the last.
        if (inputTags[i - 1].type === 'password') { // If the input-field is a type="password" it is added to the array passwordFieldArray.
            passwordFieldArray[passwordFieldArray.length] = inputTags[i - 1]; // Inserts the current field into the passwordFieldArray.
        }
    }
    return passwordFieldArray; // Returns an array of all fields of type="password".
}


/**
 * Makes pairs of password input fields and username/email input fields into an array.
 * @param passwordFieldArray an array of all input fields of the type "password" that is in the current HTML of the website.
 */
function findInputFieldPairs(passwordFieldArray) {

    for (let j = passwordFieldArray.length; j > 0; j--) {
        let currentPasswordField = passwordFieldArray[j - 1] // Selects the current password field to examine.
        let currentParrentForm = parentForm(currentPasswordField); // Assigns the current 'form' of current password field to a variable.

        if (currentParrentForm !== false) { // Checks if a 'form' exists.
            let inputTags = currentParrentForm.getElementsByTagName('input'); // Creates an array of all input-fields in the current 'form'.

            for (let i = 0; i < inputTags.length; i++) {
                if (inputTags[i] !== currentPasswordField && (inputTags[i].type === 'email' || inputTags[i].type === 'text')) { // If the field examined, isn't the current password field and is of the type "text" or "email".
                    return [inputTags[i], currentPasswordField]; // Returns an array of pairs of username- and password fields.
                }
            }
        }
    }
}

/**
 * Finds the input fields with the type 'password' in the given form.
 * @param form an element with the class 'form' in the DOM.
 */
function findPasswordFieldInForm(form) {
    const inputFields = form.getElementsByTagName('input'); // Makes an array of all input fields in the form. 
    let passwordFields = []
    for (elem of inputFields) {
        if (elem.type === "password") passwordFields.push(elem) // If an element with the type "password" is found then, it returns that element. 
    }
    return passwordFields; // if no elements with the type password can be found in the form it returns false
}