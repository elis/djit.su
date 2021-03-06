import React, { useEffect } from 'react'
import { HashRouter as Router, Route, Switch, useHistory } from 'react-router-dom'
import DjitsuLayout from '../layout'
import Djot from './sections/djot'
import CleanSection from './sections/clean'
import DjitsuEditor from './sections/editor'
import DjitsuHome from './sections/home'
import { useSystem } from '../services/system'
import { systemCommand, systemLoading } from '../state/atoms/system'
import { routerReady } from '../state/atoms/router'
import { useRecoilState, useRecoilValue } from 'recoil'

export const DjitsuRoutes: React.FC = (props) => {
  const [{ status }] = useSystem()
  const isRouterReady = useRecoilValue(routerReady)
  const systemLoadingState = useRecoilValue(systemLoading)

  return (<Router>
    <RouterHandler />
    <DjitsuLayout loading={!!systemLoadingState || status !== 'ready' || !isRouterReady}>
      <Switch>
        <Route path={[
          '/djot/:type/:path(.*)',
          '/djot'
          ]} component={Djot} />
        <Route path='/editor' component={DjitsuEditor} />
        <Route path='/clean' component={CleanSection} />
        <Route path='/' component={DjitsuHome} />
      </Switch>
    </DjitsuLayout>
  </Router>)
}

const RouterHandler: React.FC = (props) => {
  const [, setRouterReady] = useRecoilState(routerReady)
  const [systemCommandState, setSystemCommand] = useRecoilState(systemCommand)
  const history = useHistory()

  useEffect(() => {
    console.log('🍒 🥒 WE HAVE COMMAND!', systemCommandState)
    setRouterReady(true)
    if (systemCommandState?.action === 'open-file') {
      setSystemCommand(null)
      history.push('/djot/file/' + systemCommandState.path)
      setRouterReady(true)
    }
  }, [systemCommandState])

  return (<React.Fragment />)
}

export default DjitsuRoutes
