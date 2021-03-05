import React from 'react'
import { HashRouter as Router, Route, Switch } from 'react-router-dom'
import DjitsuLayout from '../layout'
import Djot from '../sections/next-djot'
import DjitsuEditor from '../sections/editor'
import DjitsuHome from '../sections/home'
import { useSystem } from '../services/system'

export const DjitsuRoutes: React.FC = (props) => {
  const [{ status }] = useSystem()

  return (<Router>
    <DjitsuLayout loading={status !== 'ready'}>
      <Switch>
        <Route path='/djot' component={Djot} />
        <Route path='/editor' component={DjitsuEditor} />
        <Route path='/' component={DjitsuHome} />
      </Switch>
    </DjitsuLayout>
  </Router>)
}

export default DjitsuRoutes
