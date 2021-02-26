import React from 'react'
import Helmet from 'react-helmet'

import { Switch, Route, Redirect } from 'djitsu/adapters/routes'
import { useOutput } from 'graze/plugins/graze-ssr-output'

import androidChrome192 from './assets/android-chrome-192x192.png'
import androidChrome512 from './assets/android-chrome-512x512.png'
import mstile from './assets/mstile-150x150.png'
import appleTouchIcon from './assets/apple-touch-icon.png'
import favicon32 from './assets/favicon-32x32.png'
import favicon16 from './assets/favicon-16x16.png'
import faviconIco from './assets/favicon.ico'

import { ssr } from 'djitsu/utils/ssr'

export const AppManifest = () => {
  return (
    <Switch>
      <Route path='/site.webmanifest' component={SiteManifest} />
      <Route path='/browserconfig.xml' component={BrowserConfigXml} />
      <Route path='/favicon.ico' component={FaviconIco} />
      <Route path='/' component={DjitsuManifest} />
    </Switch>
  )
}

export const FaviconIco = () => {
  return <Redirect to={faviconIco} />
}

export const BrowserConfigXml = () => {
  useOutput((options, req, res) => {
    res.set('Content-Type', 'application/xml')

    return `<?xml version="1.0" encoding="utf-8"?>
      <browserconfig>
        <msapplication>
          <tile>
            <square150x150logo src="${mstile}"/>
            <TileColor>#2F80ED</TileColor>
          </tile>
        </msapplication>
      </browserconfig>`
  })

  if (ssr) return <>SSR Outeput</>
  return <Redirect to='/' />
}

export const SiteManifest = () => {
  useOutput(() => {
    return {
      name: 'djitsu',
      short_name: 'djitsu',
      icons: [
        {
          src: androidChrome192,
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: androidChrome512,
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      theme_color: '#2F80ED',
      background_color: '#2F80ED',
      display: 'standalone'
    }
  })

  if (ssr) return <>SSR Outeput</>
  return <Redirect to='/' />
}

export const DjitsuManifest = () => {
  return (
    <>
      <Helmet>
        <link rel='apple-touch-icon' sizes='180x180' href={appleTouchIcon} />
        <link rel='icon' type='image/png' sizes='32x32' href={favicon32} />
        <link rel='icon' type='image/png' sizes='16x16' href={favicon16} />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='shortcut icon' href='/favicon.ico' type='icon' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
        <meta name='msapplication-TileColor' content='#2F80ED' />
        <meta name='theme-color' content='#2F80ED' />
      </Helmet>
    </>
  )
}

export default AppManifest
