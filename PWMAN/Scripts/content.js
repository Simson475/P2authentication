console.log("'we up and running' - Message from content.js");

let domaindomain = location.href //TODO fix variable name!!
chrome.runtime.sendMessage({ getToken: true }, async function(response) { //AUTOFILL FUNKTIONEN
    if (response.token === null) {
        console.log("du er ikke logget ind")
        return;
    } else if (response.token === undefined) {
        //STUB ERROR HANDLING
        console.log("response.token is undefined");
        return;
    } else {
        window.onload = () => {
            console.log(domaindomain)
            chrome.runtime.sendMessage({ cargo: domaindomain }, (response) => {
                if (response.returnCargo === undefined) {
                    //TODO ERROR HANDLING
                    console.log("error and stuff");
                } else {

                    autofill(response.returnCargo.username, response.returnCargo.password);
                }
            })
        }
    }
})

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) { //AUTOFILL ON SIGN UP
    if (request.autofillPassword !== undefined) {

        const activeForm = parentForm(document.activeElement) //Finds the last active form - meant to find the sign up sheet.
        let password = findPasswordFieldInForm(activeForm)    //Finds the password field.
        password.value = request.autofillPassword;            
        password.innerHTML = request.autofillPassword;

        await sendResponse({ autofillListenerResponse: true })
    } else {
        
        console.log("Response from content.js failed.")
        await sendResponse({ autofillListenerResponse: false })    //TODO ERROR HANDLING
    }
})

/**
 * TODO
 */
function autofill(username, password) {
    //Identificer det første input-field med type="password"
    let pswd = findPasswordField()
    let fieldPairs = correctField(pswd)
    fieldPairs[0].value = username;
    fieldPairs[0].innerHTML = username;
    fieldPairs[1].value = password;
    fieldPairs[1].innerHTML = password;
}

/**
 * TODO Function that finds the closest parent node with the name="form".
 */
function parentForm(elem) { //Function that finds the closest parent node with the name="form". 
    while (elem.parentNode) {
        if (elem.parentNode.nodeName.toLowerCase() === 'form') { //ææææææh rengøring of input
            return elem.parentNode; //returns the parent node
        }
        elem = elem.parentNode; //If not found continue upwards in the DOM-tree
    }
    return false;
};


/**
 * TODO
 */
function findPasswordField() {
    let inputs = document.getElementsByTagName('input'),
        len = inputs.length,
        ret = [];
    while (len !== 0) { //Checks the array of input-fields starting from the last.
        if (inputs[len - 1].type === 'password') { //If the input-field is a type="password" it is added to the array ret.
            ret[ret.length] = inputs[len - 1];
        }
        len--
    }
    return ret; //Returns an array of all fields of type="password".
}


/**
 * TODO
 */
function correctField(pswd) {
    let pswdLength = pswd.length;
    while (pswdLength !== 0) { // Checks all elements in the array of input-fields with type="password" starting from the last.
        let curPswdField = pswd[pswdLength - 1] //Selects the current password field to examine.
        let curParentForm = parentForm(curPswdField); //Selects the current 'form' of current password field.

        if (curParentForm) { //Checks if a 'form' exists.
            let inputs = curParentForm.getElementsByTagName('input'); //Creates an array of all input-fields in the current 'form'.
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i] !== curPswdField && (inputs[i].type === 'email' || inputs[i].type === 'text')) { //If the field examined, isn't the current password field and is of the type "text".
                    return [inputs[i], curPswdField];
                }
            }
        }
        pswdLength--
    }
}

function findPasswordFieldInForm(form) {
    let inputFields = form.getElementsByTagName('input');
    for (elem of inputFields) {
        if (elem.type === "password") return elem
    }
    return false;
}