import React, { createContext, useContext, useEffect, useRef } from 'react'
import useStates from 'djitsu/utils/hooks/use-states'

export const LayoutContext = createContext({})
export const LayoutWrapper = (props) => {
  const optsRef = useRef({})
  const [options, setOptions, resetOptions] = useStates({
    full: false
  })

  const state = {
    options
  }
  const actions = {
    setOptions: (...argz) => {
      Object.assign(optsRef.current, {
        ...(Object.entries(argz[0]).length > 1
          ? argz[0]
          : { [argz[0]]: argz[1] })
      })
      return setOptions(...argz)
    },
    resetLayout: resetOptions
  }

  const context = [state, actions, {}, () => ({})]
  return (
    <LayoutContext.Provider value={context}>
      {props.children}
    </LayoutContext.Provider>
  )
}

export const useLayout = (defaultOptions = {}) => {
  const [state, actions] = useContext(LayoutContext)

  useEffect(() => {
    if (defaultOptions && Object.keys(defaultOptions).length) {
      const oldOptions = Object.entries(defaultOptions).reduce(
        (acc, [key]) => ({ ...acc, [key]: state.options[key] }),
        {}
      )
      actions.setOptions(defaultOptions)
      return () => {
        actions.setOptions(oldOptions)
      }
    }
  }, [])

  return [state, actions]
}

export default LayoutWrapper
