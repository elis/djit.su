import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import { hydrate } from 'react-dom'
import ContentAppClient from './apps/content-app/client'
import MainAppClient from './apps/main-app/client'
import UserAppClient from './apps/user-app/client'
import HostnameAppClient from './apps/hostname-app/client'
import graze from 'graze'

const djitsuApp = () => {
  const apps = []
  const use = (regex, cb) => {
    if (!cb && typeof regex === 'object' && typeof regex.app === 'function')
      [cb, regex] = [regex.app, regex.check]

    if (!cb && typeof regex === 'function') [cb, regex] = [regex, null]
    const check = () => {
      if (typeof regex === 'function') return regex()
      else return document.location.hostname.match(regex)
    }

    apps.push({
      check,
      callback: cb
    })
    return true
  }

  const run = () => {
    let appIndex = 0

    const runApps = () => {
      const app = apps[appIndex]
      const checkResult = app.check()
      const next = () => {
        appIndex++
        return runApps()
      }
      if (checkResult) {
        return makeApp(app.callback, checkResult, next)
      } else return next()
    }
    return runApps()
  }

  const makeApp = async (cb, checkResult, next) => {
    const MadeApp = await cb(checkResult, next)
    if (MadeApp) {
      const Wrapped = await graze.wrap(MadeApp)

      hydrate(
        <BrowserRouter>
          <Wrapped />
        </BrowserRouter>,
        document.getElementById('root')
      )
    }
  }

  return {
    use,
    run
  }
}

const app = djitsuApp()

app.use(HostnameAppClient)
app.use(UserAppClient)
app.use(ContentAppClient)
app.use(MainAppClient)

app.run()

if (module.hot) {
  module.hot.accept()
}
