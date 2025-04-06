import { login } from '../actions/login'
import { CONFIGS } from '../configs'
import { readJsonFile } from '../utils/file'
import shelljs from '../utils/shelljs'
import { delay } from '../utils'
import fs from 'fs'

/**
 *
 * @returns {string}
 */
function foundCurrentDevSessionId() {
  const qtConfig = readJsonFile('../../../.qt/credentials.json')
  const devSessionID = qtConfig.devSessionId ?? null
  return devSessionID
}

/**
 * @description Força a construção de todas as extensões do Quoti CLI.
 */
async function forceBuildOfAllExtensions() {
  shelljs('qt', ['dev'])
  const packageJson = readJsonFile('../../../package.json')
  const allExtensions = packageJson?.quoti?.extensions

  await delay(5_000) // Time to qt dev is up (Qt dev was spawned in the background)

  // Changing each extension index file to force the build
  allExtensions.forEach((extension) => {
    fs.appendFileSync(extension, '')
  })

  await delay(5_000) // Time to build all extensions (Qt dev was spawned in the background)
}

export default async function setupQuotiCLI({ forceLogin = false } = {}) {
  const foundSessionId = foundCurrentDevSessionId()

  if (foundSessionId && !forceLogin) {
    CONFIGS.PAGE.DEV_SESSION_ID = foundSessionId

    return { devSessionID: foundSessionId, alreadyLoggedIn: false }
  }

  try {
    // eslint-disable-next-line no-console
    console.info('Quoti CLI is not authenticated yet, let me do it for you...')
    const token = await login({
      preservePreviousAuth: true,
      collectAuthToken: true
    })

    await shelljs('qt', ['login', '-f', '<<<', 'legis', '<<<', token]) // This is not working yet (The quoti-cli don't accept token in this way)

    CONFIGS.PAGE.DEV_SESSION_ID = foundCurrentDevSessionId()

    await forceBuildOfAllExtensions()

    return { devSessionID: CONFIGS.PAGE.DEV_SESSION_ID, alreadyLoggedIn: true }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error setting up Quoti CLI: ', { err })

    return { devSessionID: null, alreadyLoggedIn: false }
  }
}
