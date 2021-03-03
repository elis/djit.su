// @flow

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'
import MonacoEditor from '../components/monaco-editor'
import DjotPanes from '../components/djot-panes'
import useStates from '../utils/hooks/use-states'
import { useMonaco } from '@monaco-editor/react'
import { useLayoutSettings } from '../layout/hooks'
import { useThrottle } from 'ahooks'

import JavascriptCompiler from '../components/compilers/js'
import {ErrorBoundary} from 'react-error-boundary'


export const DjotSection = (props) => {
  const [offset, setOffset] = useState({})
  const [compiled, setCompiled]= useState({})
  const compilerRef: React.RefObject<JavascriptCompiler> = useRef()

  const [debugData, setDebugData] = useStates({})

  useLayoutSettings({
    sidebar: false,
    breadcrumbs: false,
    noPadding: true
  })

  const compile = useCallback(async (code) => {

    /*
      Compilation Stages
      ===========================
      1. User Input -> ES5
      2. User Input -> AST
      3. User Input -> Djot
      4. Djot -> Output
    */

    const compiled = {}
    compiled.source = code

    const compiler = compilerRef.current

    try {
      const result = await compiler.compile(code)
      Object.assign(compiled, result)
    } catch (error) {
      compiled.compileErrorMessage = `${error}`
    }

    // if (!compiled.compileErrorMessage)
    //   try {
    //     const ast = compiled.ast = await compiler.walk(code, { sourceType: 'module' })
    //     compiled.ast = ast
    //     compiled.parserErrorMessage = ''
    //   } catch (error) {
    //     compiled.parserErrorMessage = `${error}`
    //   }

    if (!compiled.parserErrorMessage)
      try {
        const display = compiled.display = await compiler.djot(code)
        compiled.djotErrorMessage = ''
      } catch (error) {
        compiled.djotErrorMessage = `${error}`
      }

    setCompiled(compiled)
    setDebugData('compiled', compiled)
  }, [])

  const onEditorMount = useCallback(async (editor) => {
    const value = editor.getModel().getValue()
    compile(value)
  }, [])

  const onEditorChange = useCallback(async (newValue) => {
    compile(newValue)
  }, [])

  const onEditorScroll = useCallback((scrollEvent) => {
    setOffset(JSON.parse(JSON.stringify(scrollEvent)))
  }, [])

  // Initialize compiler instance
  useEffect(() => {
    compilerRef.current = new JavascriptCompiler()
  }, [])

  const showExtra = false

  return (
    <DjotPanes extra={showExtra && (<>
      <h4>Compiled</h4>
      <pre>{JSON.stringify(compiled, 1, 1)}</pre>
      <h4>Compiled Source</h4>
      <pre>{debugData?.compiled?.compiled}</pre>

      <h4>Debug Data</h4>
      <pre>
        {JSON.stringify(debugData, 1, 1)}
      </pre>
    </>)}
      lineComponent={LineComponent}
      lines={compiled?.display?.output} offset={offset}>
      <MonacoEditor
        onMount={onEditorMount}
        onScroll={onEditorScroll}
        onChange={onEditorChange}
     />
    </DjotPanes>
  )
}

const LineComponent = (props) => {
  const { data: [data], index } = props
  if (data.result) {
    try {
      const res = (
        <ErrorBoundary FallbackComponent={() => <>Error :(</>}>
          {/* Show Result */}
          {data.result}
        </ErrorBoundary>
      )

      return res
    } catch (error) {
      console.log('unable to res', error)
      return <>errored</>
    }
  }
  return <>
    &nbsp;
  </>
}



export default DjotSection