import React, { useState } from 'react'
import Theme from '../theme'
import { ssr } from 'djitsu/utils/ssr'
import { useCookies } from 'react-cookie'

import graze from 'graze'

export const Application = ({ appName = 'djitsu', children }) => {
  const [cookies, setCookie] = useCookies(['djitsu-theme'])

  const cookie = !ssr ? cookies : graze?.exposed?.djj?.req?.cookies
  const themed =
    graze?.exposed?.djj?.req?.params?.theme || cookie?.['djitsu-theme']

  const [currentTheme, setCurrentTheme] = useState(themed || 'light')

  // this is a test
  // this should be the only change on `next`
  // even though this branch is based on the ricks mod
  // branch ....

  const themeSwitched = (theme = 'light') => {
    setCurrentTheme(theme)
    const expires = new Date()
    expires.setTime(expires.getTime() + 60 * 24 * 60 * 60 * 1000)
    setCookie('djitsu-theme', theme, {
      path: '/',
      expires
    })
  }

  return (
    <div className={`${appName}-app`}>
      <Theme theme={currentTheme} onChange={themeSwitched}>
        {children}
      </Theme>
    </div>
  )
}
Application.propTypes = {}

export default Application
