function validate(password) {
    console.log(password)
    return /(?=.{8,}$)((?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]))/.test(password);
}

console.log(validate("Simon23virker"))