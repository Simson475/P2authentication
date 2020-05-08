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

test("should import pepper and login to Dennis, try to create new login on page that already has a login, and then go to facebook to see if it inputs correct data", async() => {
    // Initialize puppeteer browser
    const { browser, extensionID } = await initialize()

    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();

    // Imports pepper
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`); //opens our extension 
    await page.click("a#Settings") // Clicks the settings button
    await page.click("a#importButton") // Clicks the import button
    await page.click("input#importUsername") // Clicks the input field for the username
    await page.type("input#importUsername", "Dennis") // Inputs the username "Dennis"
    await page.click("input#importPepper") // Clicks the import pepper field
    await page.type("input#importPepper", "PAbdgFBA/Lo/98jkvT9d") // Inputs the given pebber
    await page.click("input#importAccountButton") // Clicks the submit input button
    await page.waitFor(5000); // Arbitrary wait time.

    // Checks for import success message to be shown
    const firstCheck = await page.$eval('p#importSuccess', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(firstCheck).toBe("block");

    // Imports pepper again. should give warning for overwrite 
    await page.type("input#importUsername", "Dennis") // Inputs the username Dennis
    await page.click("input#importPepper") // Clicks the import pepper field
    await page.type("input#importPepper", "PAbdgFBA/Lo/98jkvT9d") // Inputs the pebber
    await page.click("input#importAccountButton") // Clicks the submit button

    // Checks if the user gets a warning trying to import pebber when something is already stored
    const secondCheck = await page.$eval('div#importWarning', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(secondCheck).toBe("inline");

    //exports pepper and checks if its the same
    await page.waitFor(5000); // Arbitrary wait time.
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    await page.click("input#LogIn-username") // Clicks the login field
    await page.type("input#LogIn-username", "Dennis") // Inputs the username "Dennis"
    await page.click("input#LogIn-password") // Clicks the input field for password
    await page.type("input#LogIn-password", "1234") // Inputs the password "1234"
    await page.click("input#LogIn-submit") // Submits username and password
    await page.waitFor(5000); // Arbitrary wait time.
    await page.click("a#Settings") // Clicks settings button
    await page.waitFor(500); // Arbitrary wait time.
    await page.click("a#exportButton") // Clicks export pepper button
    await page.waitFor(5000); // Arbitrary wait time.

    const thirdCheck = await page.$eval('p#Pepper', (elem) => { // Gets pepperstring from the element it is written in
        return elem.innerHTML
    })
    expect(thirdCheck).toBe("PAbdgFBA/Lo/98jkvT9d"); // Expects the visible pepper to be the same one as we imported.


    browser.close()
}, 100000)