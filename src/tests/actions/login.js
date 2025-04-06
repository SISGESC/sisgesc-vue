/* eslint-disable no-undef */
import { SELECTORS } from '../selectors'
import dotenv from 'dotenv'
import { delay } from '../utils'
import { CONFIGS } from '../configs'
import { APP_BAR } from '../selectors/_appbar'
import { setupBrowser } from '../utils/setup'

dotenv.config()

/**
 *
 * @description Copy the authentication token
 * @returns {Promise<{ token: string }>}
 */
async function copyAuthToken() {
  const { page } = await setupBrowser()

  await page.keyboard.press('k')
  await page.type(SELECTORS.INPUTS.SEARCH, 'Obter token de acesso')
  await delay(200)
  await page.click(SELECTORS.OPTIONS.LIST_OPTION)
  await delay(500)
  await page.keyboard.press('Escape')

  const token = await page.evaluate(() => {
    return navigator.clipboard.readText()
  })

  return { token: token }
}

/**
 *
 * @param {import('puppeteer').Page} page
 * @returns
 */
export async function checkIfIsAuthenticated(page = null) {
  try {
    if (!page) {
      const { page: pageInstance } = await setupBrowser()
      page = pageInstance
    }

    await page.goto(CONFIGS.PAGE.CREATE_SOLICITATION)

    const avatarElement = await page.waitForSelector(APP_BAR.USER_AVATAR, {
      timeout: 5_000
    })
    await avatarElement.click()

    await page.waitForFunction(
      (username) => document.body.textContent.includes(username),
      { timeout: 2_000 },
      CONFIGS.CREDENTIALS.USER_NAME
    )

    await page.waitForFunction(
      (email) => document.body.textContent.includes(email),
      { timeout: 2_000 },
      CONFIGS.CREDENTIALS.EMAIL
    )

    return true
  } catch (err) {
    const notFoundAvatar =
      err.message.includes('Waiting for selector') &&
      err.message.includes(APP_BAR.USER_AVATAR)
    const notFoundUserMailOrName = err.message.includes(
      'waiting for function failed'
    )
    if (notFoundAvatar || notFoundUserMailOrName) {
      return false
    }
    console.error('Error on checkIfIsAuthenticated', { err })
    throw err
  }
}

async function loginSteps() {
  const { page } = await setupBrowser()
  await page.goto(CONFIGS.PAGE.LOGIN)

  await page.waitForSelector(SELECTORS.BUTTONS.START, { timeout: 5_000 })
  await page.click(SELECTORS.BUTTONS.START)

  await page.waitForSelector(SELECTORS.INPUTS.CPF_PASSWORD, { timeout: 5_000 })
  await page.type(SELECTORS.INPUTS.CPF_PASSWORD, CONFIGS.CREDENTIALS.CPF, {
    delay: 100
  })

  await page.click(SELECTORS.BUTTONS.CONTINUE)

  // Não funciona no github-actions:
  // await page.waitForFunction(
  //   () => document.body.textContent.includes('Esqueceu a senha?'),
  //   { timeout: 10_000 }
  // )

  await delay(5_000)

  await page.type(SELECTORS.INPUTS.CPF_PASSWORD, CONFIGS.CREDENTIALS.PASSWORD, {
    delay: 100
  })
  await page.click(SELECTORS.BUTTONS.CONTINUE)

  await page.waitForFunction(
    () => document.body.textContent.includes('Solicitação automatizada'),
    { timeout: 10_000 }
  )

  await delay(500)
}

/**
 *
 * @description Logout from the platform, returns true if the user is logged out
 * @param {import('puppeteer').Page} page
 * @returns {Promise<boolean>}
 */
export async function logout(page = null) {
  try {
    if (!page) {
      const { page: pageInstance } = await setupBrowser()
      page = pageInstance
    }
    const isAuthenticated = await checkIfIsAuthenticated(page)
    if (!isAuthenticated) {
      return true
    }

    const logoutButton = await page.waitForSelector(APP_BAR.LOGOUT_BUTTON)
    await logoutButton.click()

    return true
  } catch (err) {
    return false
  }
}

/**
 *
 * @description Login into the platform
 * @param {{
 * collectAuthToken: boolean
 * }} param0
 * @returns
 */
export async function login({
  preservePreviousAuth = false,
  collectAuthToken = false
} = {}) {
  let shouldExecuteLoginSteps = true
  if (preservePreviousAuth) {
    const isAlreadyLoggedIn = await checkIfIsAuthenticated()
    shouldExecuteLoginSteps = !isAlreadyLoggedIn
  }

  if (shouldExecuteLoginSteps) {
    await loginSteps()
  }

  if (!collectAuthToken) {
    return
  }

  return await copyAuthToken()
}
