import React, { useCallback, useState, useEffect } from 'react'
import { useSelector, useDispatcher } from 'djitsu/store'
import { initializeSystem } from 'djitsu/store/system/actions'
import { ssr } from 'djitsu/utils/ssr'

const SystemContext = React.createContext([{}, {}])

export const SystemProvider = (props) => {
  const [initializing] = useState(false)
  // const storeState = useSelector((state) => state.system)
  const initialized = useSelector((state) => state.system.initialized)
  const [isSafeMode, setSafeMode] = useState()

  const store = useDispatcher({ initializeSystem })

  const state = {
    initializing,
    initialized,
    safemode: isSafeMode
  }

  const start = useCallback(
    async (safemode = false) => {
      // if (initialized) throw new Error('System started')
      if (initialized) {
        console.log('System restarting...')
      } else {
        if (initializing) throw new Error('System starting')

        const { RAZZLE_DV: dv } = ssr ? process.env : window.env
        // console.log('System Starting', ssr ? process.env : window.env)
        // console.log('System Plugins', graze.exposed)

        store.initializeSystem(dv, {})
        setSafeMode(safemode)
      }
    },
    [initialized, initializing]
  )

  const actions = {
    start
  }
  const context = [state, actions]

  useEffect(() => {
    start()
  }, [])

  return (
    <SystemContext.Provider value={context}>
      {props.children}
    </SystemContext.Provider>
  )
}

SystemProvider.propTypes = {}

export default SystemProvider
