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
        

        if (answer){
            console.log(answer);
        }
        else {
            document.getElementById("username").style.borderColor="#BA1919";
            document.body.style.height = "280px";
            document.getElementById("create").style.top = "250px";
            document.getElementById("return").style.top = "250px";
            document.getElementById("inUse").style.display = "inline"; 
        }

        form.reset();
    }
    else{
        document.body.style.height = "280px";
        document.getElementById("create").style.top = "250px";
        document.getElementById("return").style.top = "250px";
        document.getElementById("firstPassword").style.borderColor = "#BA1919";
        document.getElementById("secondPassword").style.borderColor = "#BA1919";
        document.getElementById("wrongPassword").style.display = "inline"; 

    }
}

