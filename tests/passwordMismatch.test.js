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

test("loginTest, should say passwords doesn't match", async() => {

    // Initialize pupeteer browser
    const { browser, extensionID } = await initialize()

    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`); // Enters the extension

    // Inputs two different passwords
    await page.click("a#create") // Clicks the crate button
    await page.click("input#username") // Clicks the input username field
    await page.type("input#username", "test") // Inputs the username "test"
    await page.click("input#firstPassword") // Clicks the first password field
    await page.type("input#firstPassword", "1234Test") // Inputs the password "1234Test"
    await page.click("input#secondPassword") // Clicks the second password field
    await page.type("input#secondPassword", "Test4321") // Inputs the password "Test4321"
    await page.click("input#create") // Clicks the create button

    // Checks if the extension throws an error for first and second password not matching
    const result = await page.$eval('label#wrongPassword', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(result).toBe("block");

    browser.close()
}, 100000)