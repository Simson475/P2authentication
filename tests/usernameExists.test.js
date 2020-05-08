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

test("should say username already exists", async() => {
    // Initialize pupeteer browser
    const { browser, extensionID } = await initialize()


    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage(); // Opens new page

    //tries to make account with username already in use
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`); // Navigates to chrome extension
    await page.click("a#create") // Clicks into acocunt creation
    await page.click("input#username")
    await page.type("input#username", "test") // Inputs username
    await page.click("input#firstPassword")
    await page.type("input#firstPassword", "Hejsa1234") // Inputs password
    await page.click("input#secondPassword")
    await page.type("input#secondPassword", "Hejsa1234") // Inputs password again.
    await page.click("input#create") // Creates account
    await page.waitFor(5000); // Arbitrary wait time.

    const result = await page.$eval('label#inUse', (elem) => { // Finds visbility of error message for username already exists
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(result).toBe("block"); // Expects it to be visible

    browser.close() // Closes puppeteer
}, 100000)