const { hashCode, checkRegex, generatePassword } = require("./../src/util.js")

/*------------------------------------------hashCode test-------------------------------------------------------*/

test("hashCode should always give the same output with same input", () => {
    const firstResult = hashCode("ELON X Æ A-12")
    const secondResult = hashCode("ELON X Æ A-12")
    expect(firstResult).toBe(secondResult)
})

test("hashCode should with two hashes with different names in general not give the same outcome", () => {
    const firstResult = hashCode("ELON X Æ A-12")
    const secondResult = hashCode("GRIMES IDORU")
    expect(firstResult).not.toBe(secondResult)
})

test("hashCode should always give the same output with same input now tested with really long names", () => {
    const firstResult = hashCode("ELON X Æ A-12 og så bare en masse bullshit bagefter12")
    const secondResult = hashCode("ELON X Æ A-12 og så bare en masse bullshit bagefter")
    expect(firstResult).not.toBe(secondResult)
})

test("hashCode should with two hashes with different names in general not give the same outcome now tested with the same ending, but with different beginning", () => {
    const firstResult = hashCode("DET HER ER BULLSHIT ÅBENBART, 123456789 ELON X Æ A-12")
    const secondResult = hashCode("DET HER, ER OGSÅ BULLSHIT ÅBENBART 987654321 ELON X Æ A-12")
    expect(firstResult).not.toBe(secondResult)
})

/*------------------------------------------checkRegex test-------------------------------------------------------*/

test("checkRegex should say true with an input of 8 or more letters in a combination of uppercase lowercase and numbers", () => {
    expect(checkRegex("Hejsameddigsa10")).toBeTruthy()
})
test("checkRegex should say false with less than 8 characters in a combination of uppercase lowercase and numbers", () => {
    expect(checkRegex("Hej1")).toBeFalsy()
})

test("checkRegex should not accept passwords without at least one big letter. Should say false.", () => {
    expect(checkRegex("kartoffel14")).toBeFalsy()
})

test("checkRegex should say false with no lower case letters", () => {
    expect(checkRegex("HEJSADEJSA1234")).toBeFalsy()
})

test("checkRegex should return false if no numbers", () => {
    expect(checkRegex("helloworld")).toBeFalsy()
})

/*------------------------------------------generatePassword test-------------------------------------------------------*/

test("generatePassword should not generate a password that is over 20 characters long", () => {
    for (let i = 0; i < 100; i++) {
        expect(generatePassword().split("").length).toBeLessThanOrEqual(20)
    }
})


test("generatePassword should not generate a password that is less than 15 characters long", () => {
    for (let i = 0; i < 100; i++) {
        expect(generatePassword().split("").length).toBeGreaterThanOrEqual(15)
    }
})


test("generatePassword should not make a password that contains special characters", () => {
    for (let i = 0; i < 100; i++) {
        expect(generatePassword()).not.toMatch(/([|!"$%&\/\(\)\?\^\'\\\+\-\*. ])/)
    }
})