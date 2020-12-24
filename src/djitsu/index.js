import React from 'react'
import Application from './application'
import Layout from './layout'
import DjitsuRoutes from './routes'
import DjitsuProviders from './providers'
import './style.less'
import DjitsuManifest from './components/app-manifest'

export const Djitsu = (props) => {
  return (
    <DjitsuProviders>
      <Application appName='djitter'>
        <Layout>
          <DjitsuManifest />
          {props.children || <DjitsuRoutes />}
        </Layout>
      </Application>
    </DjitsuProviders>
  )
}

Djitsu.propTypes = {}

export default Djitsu
