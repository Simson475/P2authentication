console.log("'we up and running' - Message from content.js")


window.onload = () => {
    chrome.runtime.sendMessage({ getToken: true }, async function(response) {
        if (response.token === null) {
            console.log("token lig null")
            return;
        } else if (response.token === undefined) {
            //STUB ERROR HANDLING
            console.log("response.token is undefined");
            return;
        } else {
            //on sitefinished? <-----------------------------------------gør det her.-----------------------------------------------------------------------------
            // Har user en web-token?
            //Har user credentials gemt i vores database til dette website?
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) { //Collects information on the active tab.
                // since only one tab should be active and in the current window at once
                // the return variable should only have one entry
                let activeTab = tabs[0];

                //Contacts server and requests username and password for the domain passed in the body
                let answer = await fetch("https://sw2b2-23.p2datsw.cs.aau.dk/node0/getPassword", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": response.token
                    },
                    body: JSON.stringify({ domain: activeTab.url }, null, 2)
                });
                answer = await answer.json() //parses the response

                if (answer.error != undefined) { //Checks if the answer is a error message
                    console.log(answer);

                } else { //If there was no error message.
                    console.log(answer.username + " " + answer.password);
                }
            });
        }
    })
}


/**
 * 
 */
function autofill() {
    //Identificer det første input-field med type="password"
    let fieldPairs = [],
        pswd = (() => {
            let inputs = document.getElementsByTagName('input'),
                len = inputs.length,
                ret = [];
            while (len--) { //Checks the array of input-fields starting from the last.
                if (inputs[len].type === 'password') { //If the input-field is a type="password" it is added to the array ret.
                    ret[ret.length] = inputs[len];
                }
            }
            return ret; //Returns an array of all fields of type="password".
        })(),
        pswdLength = pswd.length;

    function parentForm(elem) { //Function that finds the closest parent node with the name="form". 
        while (elem.parentNode) {
            if (elem.parentNode.nodeName.toLowerCase() === 'form') { //ææææææh rengøring of input
                return elem.parentNode; //returns the parent node
            }
            elem = elem.parentNode; //If not found continue upwards in the DOM-tree
        }
        return false;
    };
    while (pswdLength--) { // Checks all elements in the array of input-fields with type="password" starting from the last.
        let curPswdField = pswd[pswdLength], //Selects the current password field to examine.
            curParentForm = parentForm(curPswdField); //Selects the current 'form' of current password field.

        if (curParentForm) { //Checks if a 'form' exists.
            let inputs = curParentForm.getElementsByTagName('input'); //Creates an array of all input-fields in the current 'form'.
            for (let i = 0; i < inputs.length; i++) {
                if (inputs[i] !== curPswdField && (inputs[i].type === 'email' || inputs[i].type === 'text')) { //If the field examined, isn't the current password field and is of the type "text".
                    fieldPairs[fieldPairs.length] = [inputs[i], curPswdField]; //Append it to the next position of fieldPairs.
                    break;
                }
            }
        }
    }
    fieldPairs[0][0].style.color = "orange";
    fieldPairs[0][1].style.color = "orange";
    fieldPairs[0][0].value = "asd";
    fieldPairs[0][0].innerHTML = "asd";
    fieldPairs[0][1].value = 123;

    /*     fieldPairs[1][1].value = 123;
        fieldPairs[1][0].value ="asd";
        fieldPairs[1][0].innerHTML = "asd";
        fieldPairs[1][0].style.color = "blue";
        fieldPairs[1][1].style.color = "blue"; */
    return fieldPairs;
}
autofill();