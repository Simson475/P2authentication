//Event Listeners
document.querySelector("form").addEventListener("submit", formSubmit)


/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function formSubmit(event) {
    event.preventDefault();


    chrome.tabs.query({ active: true }, async function(tabs) {
        let location = tabs[0].url;
        console.log(location);

        let form = document.getElementById("form");
        let jsondata = {
            username: form.username.value,
            password: form.password.value,
            domain: location
        };
        console.log(jsondata);
        let answer = await fetch("http://127.0.0.1:3000/validate", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsondata, null, 2)
        });
        answer = await answer.json();
        console.log(answer); /*Skal fjernes på et tidspunkt*/


        if (answer == "no user with given credentials") {
            /* TODO
            STUB 
            her indsættes error message om bruger ikke eksister eller forkert login oplysning
            */

        }

        let newAnswer = await fetch("http://127.0.0.1:3000/test", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "authorization": "bearer " + answer.token
            },
            body: JSON.stringify(jsondata, null, 2)
        });

        newAnswer = await newAnswer.json();
        console.log(newAnswer)


        form.reset();
    });
}