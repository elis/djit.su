import { useLayout } from './layout.context'

export const Layout = (props) => {
  useLayout({
    ...(typeof props.full !== 'undefined' ? { full: props.full } : {})
  })

  return props.children
}

export default Layout
