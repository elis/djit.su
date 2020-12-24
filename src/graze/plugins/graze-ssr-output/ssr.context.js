import React, { createContext, useContext, useState } from 'react'
import { ssr } from 'djitsu/utils/ssr'

const SSRContext = createContext()

export const SSRProvider = ({ output, children, fields }) => {
  const [calls, setCalls] = useState({})
  const [values, setValues] = useState({})

  const localPreload = (fn, timeout) => {
    if (ssr) return output(fn, timeout)
    else {
      if (fn.id in values) return [() => ({}), values[fn.id]]
      if (fn.id in calls) return [() => ({}), undefined]
      const res = output(fn)

      // console.log('RES?', res)
      if (typeof res.then === 'function') {
        let canceled = false
        const cancel = () => {
          canceled = true
        }

        const prom = res.then(([, result]) => {
          if (!canceled) setValues((v) => ({ ...v, [fn.id]: result }))
          return result
        })
        setCalls((v) => ({ ...v, [fn.id]: prom }))
        return [cancel, undefined]
      }
      return res
    }
  }
  const state = { fields }
  const actions = { output: localPreload }
  const context = [state, actions]

  return <SSRContext.Provider value={context}>{children}</SSRContext.Provider>
}

SSRProvider.propTypes = {}

export const useSSR = () => useContext(SSRContext)

export default SSRProvider
