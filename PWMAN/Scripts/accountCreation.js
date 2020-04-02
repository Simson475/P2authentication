//Event Listeners
document.querySelector("form").addEventListener("submit", formSubmit)


/**
 * formsubmit takes information that is submitted and sends it to the server and resets the form
 * @param {object} event event that triggered the function. used to prevent default behaviour
 */
async function formSubmit(event) {
    event.preventDefault()
    let form = document.getElementById("form");
    /*Compare passwords*/
    if (form.password1.value == form.password2.value) {
        /*i tilfælde af tidligere ikke matchende password (resetter)*/
        document.body.style.height = "250px";
        document.getElementById("create").style.top = "225px";
        document.getElementById("return").style.top = "225px";
        document.getElementById("firstPassword").style.borderColor = "#101010";
        document.getElementById("secondPassword").style.borderColor = "#101010";
        document.getElementById("wrongPassword").style.display = "none"; 



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
            /*gør bodyen større så der er plads til et label mere, flytter knapperne ned, skifter border farver på password felterne og viser besked*/
            document.body.style.height = "280px";
            document.getElementById("create").style.top = "250px";
            document.getElementById("return").style.top = "250px";
            document.getElementById("username").style.borderColor="#BA1919";
            document.getElementById("inUse").style.display = "inline"; 
        }

        form.reset();
    }
    else{
        /*i tilfælde af at der tidligere er indtastet et eksisterende bruger navn (resetter)*/
        document.getElementById("username").style.borderColor="#101010";
        document.body.style.height = "280px";
        document.getElementById("create").style.top = "250px";
        document.getElementById("return").style.top = "250px";
        document.getElementById("inUse").style.display = "none"; 
        /*gør bodyen større så der er plads til et label mere, flytter knapperne ned, skifter border farver på password felterne og viser besked*/
        document.body.style.height = "280px";
        document.getElementById("create").style.top = "250px";
        document.getElementById("return").style.top = "250px";
        document.getElementById("firstPassword").style.borderColor = "#BA1919";
        document.getElementById("secondPassword").style.borderColor = "#BA1919";
        document.getElementById("wrongPassword").style.display = "inline"; 

    }
}