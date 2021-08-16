import React, { useEffect } from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
  useHistory
} from 'react-router-dom'
import { useRecoilState, useRecoilValue } from 'recoil'
import DjitsuLayout from '../layout'
import DjotRoute from './sections/djot'
import DjitRoute from './sections/djit'
import DjitsuRoute from './sections/djitsu'
import CleanSection from './sections/clean'
import DjitsuEditor from './sections/notebook'
import DjitsuHome from './sections/home'
import { useSystem } from '../services/system'
import { systemCommand, systemLoading } from '../state/atoms/system'
import { routerReady } from '../state/atoms/router'

export const DjitsuRoutes: React.FC = () => {
  const [{ status }] = useSystem()
  const isRouterReady = useRecoilValue(routerReady)
  const systemLoadingState = useRecoilValue(systemLoading)

  return (
    <Router>
      <RouterHandler />
      <DjitsuLayout
        loading={!!systemLoadingState || status !== 'ready' || !isRouterReady}
      >
        <Switch>
          <Route
            path={['/djot/:type/:path(.*)', '/djot']}
            component={DjotRoute}
          />
          <Route
            path={['/djit/:type/:path(.*)', '/djit']}
            component={DjitRoute}
          />
          <Route
            path={['/djitsu/:type/:path(.*)', '/djitsu']}
            component={DjitsuRoute}
          />
          <Route
            path={['/editor', '/notebook/d:notebookId', '/notebook/:filepath(.*)']}
            component={DjitsuEditor}
          />
          <Route path="/clean" component={CleanSection} />
          <Route path="/" component={DjitsuHome} />
        </Switch>
      </DjitsuLayout>
    </Router>
  )
}

const RouterHandler: React.FC = () => {
  const [, setRouterReady] = useRecoilState(routerReady)
  const [systemCommandState, setSystemCommand] = useRecoilState(systemCommand)
  const history = useHistory()

  useEffect(() => {
    console.log('🍒 🥒 WE HAVE COMMAND!', systemCommandState)
    setRouterReady(true)
    if (
      systemCommandState?.action &&
      systemCommandState.action === 'open-file'
    ) {
      const { path } = systemCommandState.payload || {}
      if (typeof path === 'string') {
        if (path.match(/\.djot$/)) {
          setSystemCommand(null)
          history.push(`/djot/file/${path}`)
          setRouterReady(true)
        } else if (path.match(/\.djit$/)) {
          setSystemCommand(null)
          history.push(`/djit/file/${path}`)
          setRouterReady(true)
        } else if (path.match(/\.djitsu$/)) {
          setSystemCommand(null)
          history.push(`/djitsu/file/${path}`)
          setRouterReady(true)
        }
      }
    }
  }, [systemCommandState])

  return <></>
}

export default DjitsuRoutes
