// global-setup.js
import setupJestPuppeteer from 'jest-environment-puppeteer/setup'
import { setupBrowser } from '../utils/setup'

// eslint-disable-next-line
module.exports = async (opts) => {
  try {
    // eslint-disable-next-line
    console.log('Iniciando setupJestPuppeteer...')
    await setupJestPuppeteer(opts)
    const browserInstanceJestPuppeteer = global.__jestPptr?.browsers?.[0]
    // await delay(5000)
    await setupBrowser(browserInstanceJestPuppeteer)

    // eslint-disable-next-line
    console.log('Iniciando globalSetup...')

    const setupQuotiCLI = require('./quoti-cli').default
    const { checkedLoggedIn, devSessionID } = await setupQuotiCLI({
      forceLogin: true
    })

    // eslint-disable-next-line
    console.log('All done... Setup tests!!', { checkedLoggedIn, devSessionID })
    return opts
  } catch (error) {
    // eslint-disable-next-line
    console.error('Error in globalSetup', error)
    throw error
  }
}
