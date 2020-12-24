import React from 'react'
import { ssr } from './ssr'

export const ClientOnly = (props) => {
  const { component: Component, children, render, ...rest } = props
  if (ssr) return null
  return Component ? <Component {...rest} /> : render ? render(rest) : children
}

export default ClientOnly
