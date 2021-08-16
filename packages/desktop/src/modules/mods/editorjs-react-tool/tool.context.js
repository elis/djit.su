import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react'
import { useStates } from '../../utils/hooks'

export const ToolContext = createContext([])

export const ToolProvider = props => {
  const { onChange, value } = props
  const [views, setViews] = useState([])
  const [options, setOption] = useStates(value?.options || {})
  const [viewOptions, setViewOptions] = useStates(value?.viewOptions || {})

  const state = {
    views,
    options,
    viewOptions
  }

  const setView = (name, details) => {
    setViews(v => [...v, { name, details }])
    return () => {
      setViews(v => v.filter(e => e.name === name))
    }
  }

  const toggleView = useCallback((name, show) => {
    setViewOptions(name, (v = {}) => ({
      ...v,
      hidden: typeof show !== 'undefined' ? !show : !v.hidden
    }))
  }, [])

  const setBlockName = useCallback(newName => {
    setOption('name', newName)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    onChange?.({ options, viewOptions })
  }, [options, viewOptions])

  const actions = {
    setView,
    toggleView,
    setBlockName
  }
  const context = [state, actions]
  return (
    <ToolContext.Provider value={context}>
      {props.children}
    </ToolContext.Provider>
  )
}

export const useTool = () => useContext(ToolContext)

export const useToolView = (viewOptions = {}) => {
  const tc = useTool()
  const [viewElm, setViewElm] = useState()
  if (tc.moo) {
    console.log('moo', viewOptions)
  }
  return [viewElm, setViewElm]
}

export default ToolProvider
