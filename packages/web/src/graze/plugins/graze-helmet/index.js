import React from 'react'
import Helmet from 'react-helmet'
const name = 'graze-helmet'

const HelmetWrapper = ({ options: { title, props = {} }, children }) => (
  <>
    <Helmet {...props}>
      <title>{title || 'Welcome to... Djitsu!'}</title>
    </Helmet>
    {children}
  </>
)

export const client = {
  name,
  onLoad: () => ({}),
  Wrapper: HelmetWrapper
}

export const server = {
  name,
  onRequest: () => ({}),
  Wrapper: HelmetWrapper,
  output: ({ options: { title } }) => {
    const helmet = Helmet.renderStatic()

    return [
      `
      ${helmet.title.toString() || title || 'Welcome to Djitsu'}
      ${helmet.meta.toString()}
      ${helmet.link.toString()}
      ${helmet.style.toString()}
      ${helmet.script.toString()}
    `
    ]
  }
}
