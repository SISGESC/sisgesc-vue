require('dotenv').config()

const  headless = process.env.HEADLESS !== 'false'
/**
 * 
 *  @type {import('jest-environment-puppeteer').JestPuppeteerConfig} 
 *
*/
const defaultSetup = {
  launch: {
    timeout: 90000,
    headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
      '--disable-notifications',
      '--start-maximized'
    ],
  },
  browserContext: "default",
  exitOnPageError: false
};

module.exports = defaultSetup