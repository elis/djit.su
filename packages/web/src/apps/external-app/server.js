import express from 'express'
const external = express()
external.use('/*', (req, res) => {
  const { vhost } = req
  if (vhost.hostname.match(/[.]local$/i)) {
    res.redirect(301, `http://localhost:${process.env.PORT}` + req.path)
  } else {
    res.redirect(301, 'https://djit.su' + req.path)
  }
})

export default external
