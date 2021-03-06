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

    // Initialize pupeteer browser
    const { browser, extensionID } = await initialize()

    // Running the actual test
    const extensionPopupHtml = './HTML/popup.html'
    const page = await browser.newPage();

    // Imports pepper for dennis
    await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
    await page.click("a#Settings")
    await page.click("a#importButton")
    await page.click("input#importUsername")
    await page.type("input#importUsername", "Dennis")
    await page.click("input#importPepper")
    await page.type("input#importPepper", "PAbdgFBA/Lo/98jkvT9d")
    await page.click("input#importAccountButton")
    await page.waitFor(5000); // arbitrary wait time.

    //checks for import success message to be shown
    const firstCheck = await page.$eval('p#importSuccess', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(firstCheck).toBe("block");

    //Login to dennis
    await page.click("a#returnSettings")
    await page.click("a#returnPop")
    await page.click("input#LogIn-username")
    await page.type("input#LogIn-username", "Dennis")
    await page.click("input#LogIn-password")
    await page.type("input#LogIn-password", "1234")
    await page.click("input#LogIn-submit")
    await page.waitFor(5000); // arbitrary wait time.

    //checks to make sure the login page is hidden when logged in.
    const secondCheck = await page.$eval('div#LogIn', (elem) => {
        return window.getComputedStyle(elem).getPropertyValue('display')
    })
    expect(secondCheck).toBe("none");

    //checks to see if account can be created on a domain with previous login information (shouldnt be possible)
    await page.click("a#SignedIn-website")
    await page.click("input#username")
    await page.type("input#username", "Dennis")
    await page.click("button#AutofillPassword")
    await page.click("input#theSubmitButton")
    await page.waitFor(5000); // arbitrary wait time.

    //checks to see if it says user already has login for website
    const thirdCheck = await page.$eval('p#errorMessage', elem => elem.innerHTML)
    expect(thirdCheck).toBe("Account already created for this website");


    //goes to facebook and should input into login fields
    await page.goto("https://www.facebook.com/");
    await page.waitFor(5000); // arbitrary wait time.

    //checks to see if it inputs login information correctly to facebook.
    const fourthCheck = await page.$eval('input#email', elem => elem.value)
    expect(fourthCheck).toBe("Simon");

    const fifthCheck = await page.$eval('input#pass', elem => elem.value)
    expect(fifthCheck).toBe("eHXZzquUIuXPsSaLy");

    await browser.close()
}, 100000)