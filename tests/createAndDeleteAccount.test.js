const puppeteer = require('puppeteer');
const extensionPath = __dirname + "/../PWMAN"

async function initialize() {
    const browser = await puppeteer.launch({
        headless: false, // Extension are allowed only in the head-full mode
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });
    // Finds our extensions id using the extension name from manifest.json
    const name = "Password Manager"
    const targets = await browser.targets();
    const extensionProcess = await targets.find(({ _targetInfo }) => {
        return _targetInfo.title === name && _targetInfo.type === 'background_page';
    });
    const extensionID = extensionProcess._targetInfo.url.split('/')[2];

    return { browser, extensionID };
}


test("should create user and delete it afterwards", async() => {
    // Initialize pupeteer browser
    const { browser, extensionID } = await initialize()

    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();

    // Creates user account
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    await page.click("a#create")
    await page.waitFor(500); // Arbitrary wait time.
    await page.click("input#username")
    await page.type("input#username", "DeleteTest1")
    await page.click("input#firstPassword")
    await page.type("input#firstPassword", "Delete1234")
    await page.click("input#secondPassword")
    await page.type("input#secondPassword", "Delete1234")
    await page.click("input#create")
    await page.waitFor(5000); // Arbitrary wait time.

    const firstCheck = await page.$eval('h3#accountSuccess', (elem) => {
            return window.getComputedStyle(elem).getPropertyValue('display')
        })
        // Expects user to be created succesfully
    expect(firstCheck).toBe("block");


    // Login to newly made account
    await page.click("a#return")
    await page.waitFor(500); // Arbitrary wait time.
    await page.click("input#LogIn-username")
    await page.type("input#LogIn-username", "DeleteTest1")
    await page.click("input#LogIn-password")
    await page.type("input#LogIn-password", "Delete1234")
    await page.click("input#LogIn-submit")
    await page.waitFor(5000); // Arbitrary wait time.

    // Checks to make sure the login page is hidden when logged in.
    const secondCheck = await page.$eval('div#LogIn', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(secondCheck).toBe("none");


    // Deletes the account
    await page.click("a#Settings")
    await page.waitFor(500); // Arbitrary wait time.
    await page.click("a#deleteButton")
    await page.waitFor(500); // Arbitrary wait time.
    await page.click("input#AuthDelete")
    await page.type("input#AuthDelete", "DELETE")
    await page.click("input#AuthDeleteButton")
    await page.waitFor(5000); // Arbitrary wait time.

    const thirdCheck = await page.$eval('p#deletionMessage', (elem) => {
        return elem.innerHTML
    })
    expect(thirdCheck).toBe("Your account has been deleted!");


    // Attempts to login to deleted account
    await page.click("a#BackButton")
    await page.waitFor(500); // Arbitrary wait time.
    await page.click("input#LogIn-username")
    await page.type("input#LogIn-username", "DeleteTest1")
    await page.click("input#LogIn-password")
    await page.type("input#LogIn-password", "Delete1234")
    await page.click("input#LogIn-submit")
    await page.waitFor(5000); // Arbitrary wait time.

    const fourthCheck = await page.$eval('p#LogIn-paragraph', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(fourthCheck).toBe("block");

    browser.close()
}, 100000)