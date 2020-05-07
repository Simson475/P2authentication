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

test("loginTest, should say passwords doesn't match", async() => {

    //initialize pupeteer browser
    const { browser, extensionID } = await initialize()

    //running the actual test
    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`); //enters the extension
    await page.click("a#create") //clicks the crate button
    await page.click("input#username") //clicks the input username field
    await page.type("input#username", "test") //inputs the username "test"
    await page.click("input#firstPassword") //clicks the first password field
    await page.type("input#firstPassword", "1234Test") //inputs the password "1234Test"
    await page.click("input#secondPassword") //clicks the second password field
    await page.type("input#secondPassword", "Test4321") //inputs the password "Test4321"
    await page.click("input#create") //clicks the create button

    //checks if the extension throws an error for first and second password not matching
    const result = await page.$eval('label#wrongPassword', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })

    await browser.close()
    expect(result).toBe("block");

}, 100000)