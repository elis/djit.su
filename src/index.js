import http from 'http'

let app = require('./server').default

const server = http.createServer(app)

const envs = Object.entries(process.env)

const { PORT, HEROKU_PORT } = process.env
let currentApp = app
const port =
  (envs.find(([name]) => name === 'PORT') || [])[1] ||
  HEROKU_PORT ||
  PORT ||
  3000

server
  .listen(port, () => {
    console.log('🚀 started - ', port)
  })
  .on('error', (error) => {
    console.log(error)
  })

if (module.hot) {
  console.log('✅  Server-side HMR Enabled!')

  module.hot.accept('./server', () => {
    console.log('🔁  HMR Reloading `./server`...')

    try {
      app = require('./server').default
      server.removeListener('request', currentApp)
      server.on('request', app)
      currentApp = app
    } catch (error) {
      console.log(error)
    }
  })
}
