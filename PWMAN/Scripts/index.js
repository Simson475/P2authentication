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
            body: JSON.stringify(jsondata, null, 2)
        });
        answer = await answer.json();
        console.log(answer);

        form.reset();
    });
}