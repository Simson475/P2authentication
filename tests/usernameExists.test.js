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

test("should say username already exists", async() => {
    //initialize pupeteer browser
    const { browser, extensionID } = await initialize()

    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    await page.click("a#create")
    await page.click("input#username")
    await page.type("input#username", "test")
    await page.click("input#firstPassword")
    await page.type("input#firstPassword", "Hejsa1234")
    await page.click("input#secondPassword")
    await page.type("input#secondPassword", "Hejsa1234")
    await page.click("input#create")
    await page.waitFor(5000); // arbitrary wait time.
    const result = await page.$eval('label#inUse', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })

    await browser.close()
    expect(result).toBe("block");

}, 100000)