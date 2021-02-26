import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import DjitsuLayout from '../layout'
import Djot from '../sections/djot'
import DjitsuEditor from '../sections/editor'
import DjitsuHome from '../sections/home'

export const DjitsuRoutes: React.FC = (props) => {
  return (<Router>
    <DjitsuLayout>
      <Switch>
        <Route path='/djot' component={Djot} />
        <Route path='/editor' component={DjitsuEditor} />
        <Route path='/' component={DjitsuHome} />
      </Switch>
    </DjitsuLayout>
  </Router>)
}

export default DjitsuRoutes
