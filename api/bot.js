const puppeteer = require("puppeteer");

let browser; // Один браузер для всіх сесій
let pages = []; // Зберігання сторінок для кожної сесії

const initializeBrowser = async () => {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--use-fake-ui-for-media-stream"],
        });
    }
};

const joinMeetingBot = async () => {
    await initializeBrowser();
    const sessionId = generateSessionId();

    const page = await browser.newPage();
    pages.push({
        id: sessionId,
        page: page,
    })

    await page.goto("http://localhost:3001/bot-page", {
        waitUntil: "load",
        timeout: 0,
    });
    //  // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0);

    await page.click("button")

    setTimeout(async () => {
        console.log(browser)
        console.log(pages)
        // await browser.close();
    }, 5000)
}

const stopBotSession = async (sessionId) => {
    const page = pages[sessionId];
    if (page) {
        await page.close(); // Закриваємо сторінку
        console.log(`Bot session ${sessionId} stopped and page closed.`);
    } else {
        console.log(`No page found for session: ${sessionId}`);
    }
};

const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15); // Простий приклад генерації ID
};

module.exports = {
    joinMeetingBot,
    stopBotSession
};