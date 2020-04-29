const puppeteer = require('puppeteer');
const extensionPath = __dirname + "/PWMAN"

async function initialize() {
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

test("should say passwords doesn't match", async() => {

    //initialize pupeteer browser
    const { browser, extensionID } = await initialize()

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

})


test("should import pepper and login to Dennis, try to create new login on page that already has a login, and then go to facebook to see if it inputs correct data", async() => {

    //initialize pupeteer browser
    const { browser, extensionID } = await initialize()

    //running the actual test
    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    await page.click("a#Settings")
    await page.click("input#importButton")
    await page.click("input#importUsername")
    await page.type("input#importUsername", "Dennis")
    await page.click("input#importPepper")
    await page.type("input#importPepper", "PAbdgFBA/Lo/98jkvT9d")
    await page.click("input#importAccountButton")
    await page.waitFor(1000); // arbitrary wait time.

    //checks for import success message to be shown
    const firstCheck = await page.$eval('p#importSucces', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(firstCheck).toBe("inline");
    await page.click("a#returnSettings")
    await page.click("a#returnPop")
    await page.click("input#LogIn-username")
    await page.type("input#LogIn-username", "Dennis")
    await page.click("input#LogIn-password")
    await page.type("input#LogIn-password", "1234")
    await page.click("input#LogIn-submit")
    await page.waitFor(1500); // arbitrary wait time.

    //checks to make sure the login page is hidden when logged in.
    const secondCheck = await page.$eval('div#LogIn', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(secondCheck).toBe("none");

    await page.click("a#SignedIn-website")
    await page.click("input#username")
    await page.type("input#username", "Dennis")
    await page.click("input#website")
    await page.waitFor(1000); // arbitrary wait time.

    //checks to see if it says user already has login for website
    const thirdCheck = await page.$eval('p#errorMessage', elem => elem.innerHTML)
    expect(thirdCheck).toBe("Account already created for this website");

    await page.goto("https://www.facebook.com/");
    await page.waitFor(1000); // arbitrary wait time.

    //checks to see if it inputs login information correctly to facebook.
    const fourthCheck = await page.$eval('input#email', elem => elem.value)
    expect(fourthCheck).toBe("Simon");

    const fifthCheck = await page.$eval('input#pass', elem => elem.value)
    console.log(fifthCheck)
    expect(fifthCheck).toBe("eHXZzquUIuXPsSaLy");

    await browser.close()

}, 10000)