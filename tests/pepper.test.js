const puppeteer = require('puppeteer');
const extensionPath = __dirname + "/../PWMAN"

async function initialize() {
    const browser = await puppeteer.launch({
        headless: false, // extension are allowed only in the head-full mode
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });
    //finds our extensions id using the extension name from manifest.json
    const name = "Password Manager"
        //TODO browser.targets?
    const targets = await browser.targets();
    const extensionProcess = await targets.find(({ _targetInfo }) => {
        return _targetInfo.title === name && _targetInfo.type === 'background_page';
    });
    const extensionID = extensionProcess._targetInfo.url.split('/')[2];

    return { browser, extensionID };
}

test("should import pepper and login to Dennis, try to create new login on page that already has a login, and then go to facebook to see if it inputs correct data", async() => {

    //initialize pupeteer browser
    const { browser, extensionID } = await initialize()

    //running the actual test
    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`); //opens our extension 
    await page.click("a#Settings") //clicks the settings button
    await page.click("a#importButton") //clixks the import button
    await page.click("input#importUsername") //clicks the input field for the username
    await page.type("input#importUsername", "Dennis") //inputs the username "Dennis"
    await page.click("input#importPepper") //clicks the import pebber field
    await page.type("input#importPepper", "PAbdgFBA/Lo/98jkvT9d") //inputs the given pebber
    await page.click("input#importAccountButton") //clicks the submit input button
    await page.waitFor(5000); // arbitrary wait time.

    //checks for import success message to be shown
    const firstCheck = await page.$eval('p#importSuccess', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(firstCheck).toBe("block");

    await page.type("input#importUsername", "Dennis") //inputs the username Dennis
    await page.click("input#importPepper") //clicks the import pebber field
    await page.type("input#importPepper", "PAbdgFBA/Lo/98jkvT9d") //inputs the pebber
    await page.click("input#importAccountButton") //clicks the submit button

    //checks if the user gets a warning trying to import pebber when something is already stored
    const secondCheck = await page.$eval('div#importWarning', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(secondCheck).toBe("inline");
    await page.waitFor(5000); // arbitrary wait time.
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);

    await page.click("input#LogIn-username") //clicks the login field
    await page.type("input#LogIn-username", "Dennis") //inputs the username "Dennis"
    await page.click("input#LogIn-password") //clicks the input field for password
    await page.type("input#LogIn-password", "1234") //inputs the password "1234"
    await page.click("input#LogIn-submit") //submites username and password
    await page.waitFor(5000); // arbitrary wait time.
    await page.click("a#Settings") //clicks settings button
    await page.click("a#exportButton") //clicks export pepper button
    await page.waitFor(5000); // arbitrary wait time.
    const thirdCheck = await page.$eval('p#Pepper', (elem) => { //gets pepperstring from the element it is written in
        return elem.innerHTML
    })
    expect(thirdCheck).toBe("PAbdgFBA/Lo/98jkvT9d"); //expects the visible pepper to be the same one as we imported.
    browser.close()
}, 100000)