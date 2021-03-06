// @flow

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'
import MonacoEditor from '../../../components/monaco-editor'
import DjotPanes from '../../../components/djot-panes'
import LoadingScreen from '../../../components/loading-screen'
import useStates from '../../../utils/hooks/use-states'
import { useMonaco } from '@monaco-editor/react'
import { useLayoutSettings } from '../../../layout/hooks'
import { useDebounceFn, useThrottle } from 'ahooks'

import JavascriptCompiler from '../../../components/compilers/js'
import {ErrorBoundary} from 'react-error-boundary'
import useIPCRenderer from '../../../services/ipc/renderer'
import { useFileHandler } from './file-handler'
import { SystemSpinner } from '../../../schema/system'
import { DjotStatus } from '../../../schema/djot'

export const DjotSection = (props) => {
  const ipc = useIPCRenderer()

  const [offset, setOffset] = useState({})
  const [compiled, setCompiled]= useState({})
  const compilerRef: React.RefObject<JavascriptCompiler> = useRef()

  const [panesReady, setPanesReady] = useState()
  const [paneWidth, setPaneWidth] = useState(0)
  const [debugData, setDebugData] = useStates({})

  const file = useFileHandler(props)

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
    // Initialize compiler
    compilerRef.current = new JavascriptCompiler()

    // Load pane width
    ipc.invoke('get-pane-width').then((savePaneWidth) => {
      console.log('loaded pane width:', savePaneWidth)
      setPanesReady(true)
      setPaneWidth(savePaneWidth || 600)
    })
  }, [])

  const { run: onPanesChange } = useDebounceFn((newWidth) => {
    ipc.invoke('save-pane-width', newWidth)
  }, { wait: 300, leading: true })

  const showExtra = false

  useEffect(() => {
    console.log('🗃 🗂 file updated:', file)
  }, [file])

  const saveToFile = useCallback(async (newData) => {
    const result = await file.setFileContents(newData)
    console.log('Result of set file contents:', result)
  }, [file])

  return (
    <StyledContainer
    className={offset.scrollTop > 0 ? 'scrl-top' : ''}
    >
      {file.loading && <LoadingScreen {...file.loading} />}
      {file.status === DjotStatus.Ready && panesReady && <DjotPanes
      onChange={onPanesChange}
      style={{ '--scroll-height': offset?.scrollHeight + 'px', '--scroll-top': (offset?.scrollTop * -1) + 'px' }}
      size={paneWidth}
      extra={showExtra && (<>
        <h4>OFfset</h4>
        <pre>{JSON.stringify(offset, 1, 1)}</pre>
        <h4>Compiled</h4>
        <pre>{JSON.stringify(compiled, 1, 1)}</pre>
        <h4>Compiled Source</h4>
        <pre>{debugData?.compiled?.compiled}</pre>

        <h4>Debug Data</h4>
        <pre>
          {JSON.stringify(debugData, 1, 1)}
        </pre>
      </>)}
        linePropsHandler={([line], lineIndex) => {
          return line.result ? ({
            style: {
              '--lines': line.lines || 0
            }
          }) : {}
        }}
        lineComponent={LineComponent}
        lines={compiled?.display?.output}
        // offset={offset}
        >
        <MonacoEditor
          code={file.contents}
          onSave={saveToFile}
          onMount={onEditorMount}
          onScroll={onEditorScroll}
          onChange={onEditorChange}
      />
      </DjotPanes>}
    </StyledContainer>
  )
}

const StyledContainer = styled.div`
  --header-height: 77px;

  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  > .SplitPane {
    max-height: calc(100vh - var(--header-height));
    --editor-height: calc(100vh - var(--header-height));
  }

  &::before {
    content: "";
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: -10px;
    height: 10px;
    background: #00000000;
    box-shadow: 0px 2px 5px rgba(0,0,0,0.5);
    z-index: 10;
    opacity: 0;
    transition: all 120ms ease-in;
  }
  &.scrl-top {
    &::before {
      opacity: 1;
    }
  }
`

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
      console.error('unable to res', error)
      return <>errored</>
    }
  }
  return <>
    &nbsp;
  </>
}



export default DjotSection
