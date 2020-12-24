import React from 'react'
import cookieParser from 'cookie-parser'
export const app = {
  onLoad: () => ({}),
  Wrapper: ({ children }) => {
    const { CookiesProvider } = require('react-cookie')
    return <CookiesProvider>{children}</CookiesProvider>
  }
}

export const server = {
  onRequest: () => ({}),
  middleware: (req, res, next) => {
    cookieParser()(req, res, next)
  }
}
