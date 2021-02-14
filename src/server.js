import express from 'express'
import vhost from 'vhost'

import contentApp from 'apps/content-app/server'
import externalApp from 'apps/external-app/server'
import hostnameApp from 'apps/hostname-app/server'
import mainApp from 'apps/main-app/server'
import userApp from 'apps/user-app/server'

const wrapper = express()
wrapper
  .use(vhost('djitsu.local', externalApp))
  .use(vhost('*.djitsu.local', userApp))
  .use(vhost('*.*.djitsu.local', userApp))
  .use(vhost('djitsu.me', externalApp))
  .use(vhost('*.djitsu.me', userApp))
  .use(vhost('*.*.djitsu.me', userApp))
  .use(vhost('djitapp.local', externalApp))
  .use(vhost('djit.app', externalApp))
  .use(vhost('djit.me', externalApp))
  .use(vhost('*.djitapp.local', hostnameApp))
  .use(vhost('*.djit.app', hostnameApp))
  .use(vhost('*.djit.me', hostnameApp))
  .use(vhost('*.*', hostnameApp))
  .use(vhost('*.*.*', hostnameApp))
  .use(vhost('*', contentApp))
  .use(vhost('*', mainApp))
  .use(vhost('*.*', contentApp))
  .use(vhost('*.*', mainApp))
  .use(vhost('*.*.*', contentApp))
  .use(vhost('*.*.*', mainApp))
  .use(vhost('*.*.*.*', contentApp))
  .use(vhost('*.*.*.*', mainApp))

export default wrapper
