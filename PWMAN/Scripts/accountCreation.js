//Event Listeners
document.querySelector("form").addEventListener("submit", formSubmit)


/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function formSubmit(event) {
    event.preventDefault()
    let form = document.getElementById("form");
    console.log("jaja");
    /*Compare passwords*/
    if (form.password1.value == form.password2.value){

        let jsondata = {
            username: form.username.value,
            password: form.password1.value
        };

        let answer = await fetch("http://127.0.0.1:3000/newUser", {
        method: 'POST',
        body: JSON.stringify(jsondata, null, 2)
        });
        
        answer = await answer.json()
        console.log(answer)

        form.reset();
    }
    else{

    }
}

