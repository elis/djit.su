import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import ReactJson from 'react-json-view'
import * as ReactIs from 'react-is';
import { useHistory } from 'react-router-dom'
import { useDebounceFn, useThrottle } from 'ahooks'
import { useMonaco } from '@monaco-editor/react'
import { Alert, Button, Result } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'

import MonacoEditor from '../../../components/monaco-editor'
import DjotPanes from '../../../components/djot-panes'
import LoadingScreen from '../../../components/loading-screen'
import useStates from '../../../utils/hooks/use-states'
import { useLayoutSettings } from '../../../layout/hooks'

import JavascriptCompiler from '../../../components/compilers/js'
import useIPCRenderer from '../../../services/ipc/renderer'
import { useFileHandler } from './file-handler'
import { SystemSpinner } from '../../../schema/system'
import { DjotStatus } from '../../../schema/djot'

import ReactJsonTheme from './djitsu-to-react-json-theme'

export const DjotSection = props => {
  const ipc = useIPCRenderer()
  const history = useHistory()

  const [offset, setOffset] = useState({})
  const [compiled, setCompiled]= useState({})
  const compilerRef = useRef()

  const [panesReady, setPanesReady] = useState()
  const [paneWidth, setPaneWidth] = useState(0)
  const [debugData, setDebugData] = useStates({})

  const file = useFileHandler({
    filePath: props.match.params?.path || 'untitiled'
  })

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

  const saveToFile = useCallback(async (newData, setNewName) => {
    if (setNewName || !file.filePath || file.filePath === 'untitiled') {
      const newFilePath = await file.saveFileAs(newData)
      if (newFilePath) history.push(`/djot/file/${newFilePath}`)
    }
    else
      await file.setFileContents(newData)
  }, [file])

  const [reloading, setReloading] = useState(false)
  const reloadFile = useCallback(async () => {
    setReloading(true)
    await file.reload()
    setReloading(false)
  }, [reloading])

  const linePropsHandler = useCallback(([line], lineIndex) => {
    return line.result ? ({
      style: {
        '--lines': line.lines || 0
      }
    }) : {}
  }, [])

  return (
    <StyledContainer
    className={offset.scrollTop > 0 ? 'scrl-top' : ''}
    >
      {file.error && (
        <Result
          status="error"
          title="File Error"
          subTitle={
            <Alert message={<code>{file.error.message}</code>} type="error" />}
          style={{margin: 'auto 0'}}
          extra={[
            <Button type="primary" key="home" onClick={() => history.push('/')}>
              Back to Home
            </Button>,
            <Button key="again" onClick={reloadFile}>Try Again</Button>,
          ]}
        >
          {file.error.stack && (
            <pre>{`${file.error.stack}`}</pre>
          )}
        </Result>
      )}
      {!file.error && file.status === 'loading' && <LoadingScreen {...file.loading} />}
      {file.status === 'success' && panesReady && <DjotPanes
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
        linePropsHandler={linePropsHandler}
        lineComponent={LineComponent}
        lines={compiled?.display?.output}
        // offset={offset}
        >

          <div>
            {/* <Button type='primary' icon={<ReloadOutlined />} onClick={reloadFile}>Reload File</Button> */}
            {reloading ? 'reloading...' : (
              <MonacoEditor
                code={file.data}
                onSave={saveToFile}
                onSaveAs={newData => saveToFile(newData, true)}
                onMount={onEditorMount}
                onScroll={onEditorScroll}
                onChange={onEditorChange}
              />
            )}

          </div>
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
    // console.log('line component renderering result:', data.result)
    if (typeof data.result === 'string' || typeof data.result === 'number')
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
    else if ([ReactIs.Element, ReactIs.ForwardRef].indexOf(ReactIs.typeOf(data.result)) >= 0)
      return (
        <ErrorBoundary FallbackComponent={() => <>Error :(</>}>
          {data.result}
        </ErrorBoundary>
      )
    else
      return (
        <ErrorBoundary FallbackComponent={() => <>Error :(</>}>
          {/* {console.log('Typeof:', ReactIs.typeOf(data.result))} */}
        <ReactJson theme={ReactJsonTheme()} src={data.result} />
        </ErrorBoundary>
      )
  }
  return <>&nbsp;</>
}

export default DjotSection
