import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ssr } from 'djitsu/utils/ssr'
import isReact from 'is-react'
import { isNode } from 'djitsu/utils/elements'
import { useTheme } from 'djitsu/theme'
import { useCompile } from 'djitsu/providers/compile'
import { useTelemetry } from 'djitsu/providers/telemetry'

import styled from 'styled-components'

const DEBUG = false

export const NotebookRenderer = (props) => {
  const [, { reportMissingHandler }] = useTelemetry()
  const { notebook, exported } = props
  const [compiledComp, setCompiledComp] = useState()
  const compiledRef = useRef()
  const domRef = useRef()
  const [theme] = useTheme()
  const [initialized, setInitialized] = useState()
  const [compiledExports, setCompiledExports] = useState()
  const [, { executeCode }] = useCompile()
  const [compiling, setCompiling] = useState()

  const init = async () => {
    try {
      const exec = await executeCode(notebook.compiled.code, {
        // loader: loaderMaker(importHandler),
        imports: notebook.compiled.imports
      })

      setInitialized(true)
      // setCompiling(false)
      setCompiledExports(exec)
    } catch (error) {
      console.log('Error initializing:', error)
      setInitialized(false)
      // setCompiling(false)
    }
  }

  const render = async (compiled) => {
    setCompiledComp()
    const exportee = compiled[exported]
    if (domRef.current.lastChild) {
      while (domRef.current.lastChild) {
        domRef.current.removeChild(domRef.current.lastChild)
      }
    }
    handleExportee(exportee)
  }

  const renderElement = (exportee, test) => {
    const isreact = Object.keys(isReact)
      .map((k) => [k, isReact[k](exportee)])
      .reduce((a, [n, v]) => ({ ...a, [n]: v }), {})
    DEBUG &&
      console.log(
        'isReact?',
        ...Object.keys(isReact).map((k) => [k, isReact[k](exportee)]),
        isreact,
        { test },
        { exportee }
      )
    if (typeof exportee !== 'function' && !isreact.compatible) return false

    if (isReact.component(exportee)) {
      if (test) return true
      return exportee
    } else if (isReact.element(exportee)) {
      if (test) return true
      return () => <>{exportee}</>
    } else {
      if (test) return true
      const result = exportee()
      if (isNode(result) || isReact.DOMTypeElement(result)) {
        domRef.current.appendChild(result)
      } else {
        const Exportee = exportee
        const resulted = () => <Exportee />

        return resulted
      }
    }
  }

  const handleExportee = async (exportee) => {
    if (renderElement(exportee, true)) {
      const Comp = renderElement(exportee)
      compiledRef.current = Comp
      if (Comp) setCompiledComp('react - ' + Date.now())
    } else if (isNode(exportee)) {
      domRef.current.appendChild(exportee)
      setCompiledComp('react - ' + Date.now())
    } else if (typeof exportee === 'object') {
      const ReactJson = (await import('react-json-view')).default
      const Comp = () => (
        <ReactJson
          name={false}
          indentWidth={2}
          collapsed={false}
          collapseStringsAfterLength={255}
          theme={theme.theme === 'dark' ? 'monokai' : 'rjv-default'}
          src={typeof exportee === 'object' ? exportee : { value: exportee }}
        />
      )
      compiledRef.current = Comp
      setCompiledComp('react - ' + Date.now())
    } else {
      reportMissingHandler(
        'Noteook render - unknown exportee',
        `No appropriate handler for content type: "${typeof exportee}"`,
        { exportee }
      )
    }
  }

  // Initilization
  useEffect(() => {
    DEBUG &&
      console.log('[ ] Init notebook renderer check', {
        initialized,
        compiling,
        extra: {
          code: notebook?.compiled?.code,
          imports: notebook?.compiled?.imports,
          exported
        }
      })
    if (!compiling && !initialized && notebook?.compiled?.code && exported) {
      DEBUG && console.log('[ ] Init check passed - initializing...')

      setCompiling(true)
      // console.log('Want to init')
      init()
    }
  }, [notebook, exported, initialized, compiling])

  useEffect(() => {
    if (compiledExports) render(compiledExports)
  }, [compiledExports, exported])

  const Comp = useMemo(() => (compiledComp ? compiledRef.current : null), [
    compiledComp,
    exported
  ])

  return (
    <>
      <StyledRendered className='rendered-output'>
        <div className='dom-container' ref={domRef}></div>
        {!ssr && Comp && <Comp />}
      </StyledRendered>
    </>
  )
}

const StyledRendered = styled.div`
  padding-bottom: 30vh;
`

export default NotebookRenderer
