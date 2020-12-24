import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

const name = 'graze-scroll-to-top'

const isSSR = typeof window === 'undefined'
export const app = {
  name,
  plugin: 'scroll-to-top',
  onLoad: () => ({}),
  Wrapper: ({ children }) => {
    return (
      <>
        <ScrollToTopControlller />
        {children}
      </>
    )
  }
}

export const ScrollToTopControlller = withRouter(({ location, history }) => {
  const { pathname, search } = location
  const { action } = history

  useEffect(() => {
    if (!isSSR && (action === 'PUSH' || action === 'REPLACE')) {
      try {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      } catch (error) {
        // just a fallback for older browsers
        window.scrollTo(0, 0)
      }
    }
  }, [pathname, search])
  return null
})
