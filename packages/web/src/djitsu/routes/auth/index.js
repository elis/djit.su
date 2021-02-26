import React from 'react'
import { Route, Switch } from 'djitsu/adapters/routes'
import DjitsuLayout from 'djitsu/layout/layout'

import Login from './route.login'
import Signup from './route.signup'
import Signout from './route.signout'

export const AuthRoutes = () => {
  return (
    <DjitsuLayout full>
      <Switch>
        <Route path='/login' component={Login} />
        <Route path='/signup' component={Signup} />
        <Route path='/signout' component={Signout} />
      </Switch>
    </DjitsuLayout>
  )
}

export default AuthRoutes
