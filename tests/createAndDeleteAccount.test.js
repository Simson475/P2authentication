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



test("should create user", async() => {
        //initialize pupeteer browser
        const { browser, extensionID } = await initialize()

        const extensionPopupHtml = './HTML/popup.html'
        const page = await browser.newPage();
        await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
        await page.click("a#create")
        await page.click("input#username")
        await page.type("input#username", "DeleteTest1")
        await page.click("input#firstPassword")
        await page.type("input#firstPassword", "Delete1234")
        await page.click("input#secondPassword")
        await page.type("input#secondPassword", "Delete1234")
        await page.click("input#create")
        await page.waitFor(3000); // arbitrary wait time.
        const firstCheck = await page.$eval('h3#accountSuccess', (elem) => {
                return window.getComputedStyle(elem).getPropertyValue('display')
            })
            //expects user to be created succesfully
        expect(firstCheck).toBe("block");

        await page.click("a#return")
        await page.click("input#LogIn-username")
        await page.type("input#LogIn-username", "DeleteTest1")
        await page.click("input#LogIn-password")
        await page.type("input#LogIn-password", "Delete1234")
        await page.click("input#LogIn-submit")
        await page.waitFor(1500); // arbitrary wait time.

        //checks to make sure the login page is hidden when logged in.
        const secondCheck = await page.$eval('div#LogIn', (elem) => {
            return window.getComputedStyle(elem).getPropertyValue('display')
        })
        expect(secondCheck).toBe("none");

        await page.click("a#Settings")
        await page.click("a#deleteButton")
        await page.click("input#AuthDelete")
        await page.type("input#AuthDelete", "DELETE")
        await page.click("input#AuthDeleteButton")
        await page.waitFor(500); // arbitrary wait time.
        const thirdCheck = await page.$eval('p#deletionMessage', (elem) => {
            return elem.innerHTML
        })

        expect(thirdCheck).toBe("Your account has been deleted!");
        await page.click("a#BackButton")
        await page.click("input#LogIn-username")
        await page.type("input#LogIn-username", "DeleteTest1")
        await page.click("input#LogIn-password")
        await page.type("input#LogIn-password", "Delete1234")
        await page.click("input#LogIn-submit")
        await page.waitFor(500); // arbitrary wait time.

        const fourthCheck = await page.$eval('p#LogIn-paragraph', (elem) => {
            return window.getComputedStyle(elem).getPropertyValue('display')
        })
        expect(fourthCheck).toBe("block");
        browser.close()

    }, 10000)
    /*
    test("Should say account deleted", async() => {

        //initialize pupeteer browser
        const { browser, extensionID } = await initialize()

        //running the actual test
        const extensionPopupHtml = './HTML/popup.html'
        const page = await browser.newPage();
        await page.goto(`chrome-extension://${extensionID}/${extensionPopupHtml}`);
        await page.click("a#Settings")
        await page.click("input#importButton")
        await page.click("input#importUsername")
        await page.type("input#importUsername", "deleteTest")
        await page.click("input#importPepper")
        await page.type("input#importPepper", "PAbdgFBA/Lo/98jkvT9d") //find en mÃ¥de at exportere det pÃ¥??
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
        await page.type("input#LogIn-username", "deleteTest")
        await page.click("input#LogIn-password")
        await page.type("input#LogIn-password", "DeletePW1234")
        await page.click("input#LogIn-submit")
        await page.waitFor(1500); // arbitrary wait time.

        //checks to make sure the login page is hidden when logged in.
        const secondCheck = await page.$eval('div#LogIn', (elem) => {
            return window.getComputedStyle(elem).getPropertyValue('display')
        })
        expect(secondCheck).toBe("none");

        await page.click("a#settings")
        await page.click("a#deleteAccount")
        await page.click("input#AuthDelete")
        await page.type("input#AuthDelete", "DELETE")
        await page.click("input#deleteAccountButton-submit")



        await browser.close()

    }, 15000)

    */