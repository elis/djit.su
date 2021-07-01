import { useState } from 'react'

const useStates = (initial: Record<string, unknown>) => {
  const [state, _setState] = useState({ ...initial })

  const setState = (
    prop:
      | string
      | ((v: Record<string, unknown>) => Record<string, unknown>)
      | Record<string, unknown>,
    value: unknown
  ) =>
    typeof prop === 'string'
      ? _setState((v) => ({
          ...v,
          [prop]: typeof value === 'function' ? value(v[prop]) : value
        }))
      : typeof prop === 'function'
      ? _setState((v) => ({ ...v, ...prop(v) }))
      : _setState((v) => ({ ...v, ...prop }))

  const resetState = () => _setState({ ...initial })

  return [state, setState, resetState]
}

export default useStates
