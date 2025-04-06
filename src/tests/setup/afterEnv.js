/* eslint-disable no-undef */
import 'expect-puppeteer'

import path from 'path'
import { createFile, createPath, removePath } from '@/tests/utils'
import { checkIfIsAuthenticated, login } from '../actions/login'

// eslint-disable-next-line
beforeAll(async () => {
  // eslint-disable-next-line
  page.setViewport({
    width: 1366,
    height: 768
  })

  const authenticatedBeforeCallLogout = await checkIfIsAuthenticated(page)

  if (!authenticatedBeforeCallLogout) {
    await login(page)
  }
})

// eslint-disable-next-line
afterAll(async () => {
  removePath(path.join('src', 'tests', '_tmp_files'))
  createPath(path.join('src', 'tests', '_tmp_files'))
  createFile(path.join('src', 'tests', '_tmp_files', '.gitkeep'))
})
