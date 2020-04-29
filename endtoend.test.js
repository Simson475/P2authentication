const puppeteer = require('puppeteer');
const extensionPath = __dirname + "/PWMAN"


test("should say username already exists", async() => {
    //initialize pupeteer browser
    const browser = await puppeteer.launch({
        headless: false, // extension are allowed only in the head-full mode
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });
    //finds our extensions id using the extension name from manifest.json
    const extensionName = "Password Manager"
        //TODO browser.targets?
    const targets = await browser.targets();
    const extensionTarget = await targets.find(({ _targetInfo }) => {
        return _targetInfo.title === extensionName && _targetInfo.type === 'background_page';
    });
    const extensionUrl = extensionTarget._targetInfo.url;
    const extensionID = extensionUrl.split('/')[2];

    //running the actual test
    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    await page.click("a#create")
    await page.click("input#username")
    await page.type("input#username", "test")
    await page.click("input#firstPassword")
    await page.type("input#firstPassword", "1234")
    await page.click("input#secondPassword")
    await page.type("input#secondPassword", "1234")
    await page.click("input#create")
    await page.waitFor(3000); // arbitrary wait time.
    result = await page.$eval('label#inUse', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })

    await browser.close()
    expect(result).toBe("block");

}, 10000)

test("should say username already exists", async() => {

    //initialize pupeteer browser
    const browser = await puppeteer.launch({
        headless: false, // extension are allowed only in the head-full mode
        args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`
        ]
    });

    //finds our extensions id using the extension name from manifest.json
    const extensionName = "Password Manager"

    //TODO browser.targets?
    const targets = await browser.targets();
    const extensionTarget = await targets.find(({ _targetInfo }) => {
        return _targetInfo.title === extensionName && _targetInfo.type === 'background_page';
    });

    const extensionUrl = extensionTarget._targetInfo.url;
    const extensionID = extensionUrl.split('/')[2];

    //running the actual test
    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    await page.click("a#create")
    await page.click("input#username")
    await page.type("input#username", "test")
    await page.click("input#firstPassword")
    await page.type("input#firstPassword", "1234")
    await page.click("input#secondPassword")
    await page.type("input#secondPassword", "4321")
    await page.click("input#create")
    result = await page.$eval('label#wrongPassword', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })

    await browser.close()
    expect(result).toBe("block");

}, 10000)