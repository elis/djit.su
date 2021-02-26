import React from 'react'
import { StaticRouter } from 'react-router-dom'
import express from 'express'
import { renderToString } from 'react-dom/server'
import graze from 'graze'
import App from './app'
// import secure from 'ssl-express-www'

// Fix pubdir binding since process.env.RAZZLE_PUBLIC_DIR is incorrect
const pubdir = require('path').resolve(__dirname, './public')

const server = express()
server
  .disable('x-powered-by')
  .use(express.static(pubdir))
  // .use(
  //   process.env.NODE_ENV !== 'development' ? secure : (req, res, next) => next()
  // )
  .use(graze.middleware)
  .get('/*', async (req, res) => {
    const context = {
      vhost: req.vhost
    }
    let respond = true
    const voidResponse = () => {
      respond = false
    }

    // console.log(`🐼 Begin [S]erver [S]ide [R]endering [U]ser [A]pp`)
    // console.log(`🐼 [ SSRUA ] VHOST`, req.vhost)
    const BaseApp = () => (
      <StaticRouter context={context} location={req.url}>
        <App
          username={req.vhost.length === 2 ? req.vhost[1] : req.vhost[0]}
          notebookName={req.vhost.length === 2 ? req.vhost[0] : 'main'}
        />
      </StaticRouter>
    )

    const results = await graze.doOnRequest(req, res, voidResponse)
    const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

    const {
      Wrapped,
      wrapper,
      output: getStatics,
      post: postProcess
    } = results.wrap(BaseApp)

    // console.log(`🐼🐼 Begin wrapping`)

    const makeWrapped = () => {
      const wrapped = ((wrappi) =>
        wrappi instanceof Promise
          ? wrappi
          : new Promise((resolve) => {
              try {
                // console.log('What kind of object?', wrappi)
                const stringed = renderToString(wrappi)
                resolve(stringed)
              } catch (error) {
                // const ErrorMsg = require('components/error')
                // const ErrorMsg = () => {
                //   return (
                //     <>
                //       Error: {error.code}
                //       <pre>{error.message}</pre>
                //       <pre>{error.stack}</pre>
                //     </>
                //   )
                // }
                console.error('Problem with rendering to string:', error)
                resolve(
                  `<div>Error rendering: ${error} <pre>${error.stack}</pre></div>`
                )
              }
            }))(wrapper(<Wrapped />))

      wrapped.then(async (markup) => {
        if (context.url) {
          res.redirect(context.url)
        } else {
          const [earlyStatics, lateStatics, trap] = await getStatics(markup)
          // console.log(`🐼🐼 Begin HTML Rendering`)

          if (trap) {
            // vonsole.log`🐼🐼 ${`=`}|repeat:8 Trap detected`
            // vonsole.log`${`=`}|repeat:8 🐼🐼 Trap detected`

            return makeWrapped()
          }
          if (respond) {
            // console.log('assets?', assets.client)

            const html = `<!doctype html>
              <html lang="">
              <head>
                <meta http-equiv="X-UA-Compatible" content="IE=edge" />
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1">
                ${
                  assets.client.css && Array.isArray(assets.client.css)
                    ? assets.client.css
                        .filter((k) => k.match(/^\/static/))
                        .map((k) => `<link rel="stylesheet" href="${k}">`)
                        .join('\n')
                    : assets.client.css
                    ? `<link rel="stylesheet" href="${assets.client.css}">`
                    : ''
                }
                ${
                  process.env.NODE_ENV === 'production'
                    ? `<script src="${assets.client.js}" defer></script>`
                    : `<script src="${assets.client.js}" defer crossorigin></script>`
                }
                ${earlyStatics || ''}
              </head>
              <body>
                <div id="root">${markup}</div>
                ${lateStatics || ''}
              
              </body>
              </html>`

            const processed = postProcess(html)
            // console.log(`🐼🐼 Return processed HTML`)

            res.status(200).send(processed)
          }
        }
      })
    }

    makeWrapped()
  })

export default server
