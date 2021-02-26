import { useState } from 'react'

export const useStates = (initial, debug) => {
  const [state, _setState] = useState({ ...initial })

  const setStateXi = (prop, value) => {
    console.log('🍰🍰🍰 Setting State of', { prop }, 'to', { value })
    return setState(prop, value)
  }

  const setState = (prop, value) =>
    typeof prop === 'string' && typeof value !== 'undefined'
      ? _setState((v) => ({
          ...v,
          [prop]: typeof value === 'function' ? value(v[prop]) : value
        }))
      : typeof prop === 'function'
      ? _setState((v) => ({ ...v, ...prop(v) }))
      : _setState((v) => ({ ...v, ...prop }))

  const resetState = () => _setState({ ...initial })

  return [state, debug ? setStateXi : setState, resetState]
}

export default useStates
