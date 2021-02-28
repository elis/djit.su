import React, { useCallback, useEffect, useRef, useState } from 'react'
import MonacoEditor from '../components/monaco-editor'
import { useLayoutState } from '../layout'
import { useLayoutSettings } from '../layout/hooks'
import { useMonaco } from '@monaco-editor/react'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'
import { useRecoilState } from 'recoil';
import { systemState } from '../state/atoms/system';

import JavascriptCompiler from '../components/compilers/js'

import WorkerApi from '../components/repl/WorkerApi'

export const Djot = (props) => {
  const [system, setSystem] = useRecoilState(systemState)
  const workerRef = useRef()
  const [compilerState, setCopmilerstate] = useState('offline')
  const [offset, setOffset] = useState({})
  const monaco = useMonaco()
  useLayoutSettings({
    sidebar: false,
    breadcrumbs: false,
    noPadding: true
  })

  const editorRef = useRef()
  const compilerRef: React.MutableRefObject<JavascriptCompiler> = useRef()

  const onDidScroll = useCallback((scrollEvent) => {
    setOffset(JSON.parse(JSON.stringify(scrollEvent)))
  }, [])

  const onEditorMounted = (editor) => {
    editorRef.current = editor
    console.log('editor;', editor)
  }

  const onEditorChange = async (newValue, { changes }) => {
    console.log('EDITOR CHANGED:', changes, compilerRef.current)
    if (compilerRef.current) {
      const compiler = compilerRef.current
      const compiled = await compiler.compile(newValue, {})
      console.log('compiled:', compiled)
    }
    // console.log('Compile FN:', workerRef.current.compile)
    // try {
    //   const k = {"plugins":[],"debugEnvPreset":false,"envConfig":{"browsers":"defaults, not ie 11, not ie_mob 11","electron":"1.8","isEnvPresetEnabled":true,"isElectronEnabled":false,"isNodeEnabled":false,"forceAllTransforms":false,"shippedProposals":false,"isBuiltInsEnabled":false,"isSpecEnabled":false,"isLooseEnabled":false,"isBugfixesEnabled":true,"node":"10.13","version":"","builtIns":"usage","corejs":"3.6"},"presetsOptions":{"decoratorsLegacy":false,"decoratorsBeforeExport":false,"pipelineProposal":"minimal","reactRuntime":"classic"},"evaluate":false,"presets":["env","react","stage-2"],"prettify":false,"sourceMap":false,"sourceType":"module","getTransitions":false}
    //   console.log('King...', k)
    //   const res = await workerRef.current.compile(newValue, k)
    //   console.log('COMPILE RESULT:', res)
    // } catch (error) {
    //   console.log('COMPILE ERROR:', error)

    // }
  }

  useEffect(() => {
    if (monaco?.editor) {
      monaco.editor.onDidCreateEditor((codeEditor) => {
        codeEditor.onDidScrollChange(onDidScroll)
      })
    }
  }, [editorRef.current, monaco])

  useEffect(() => {
    if (system.booted && !compilerRef.current && compilerState === 'offline') {
      console.log('system.static:', system.static)
      const compiler = new JavascriptCompiler({
        staticPath: system.static
      })
      compilerRef.current = compiler
      console.log('Compiler:', compiler)
      setCopmilerstate('pending')
      // const _workerApi = new WorkerApi();
      // workerRef.current = _workerApi
      // console.log('_workerApi:', _workerApi)
    }
  }, [system.booted, compilerState])

  // useEffect(() => {
  //   if (compilerState === 'pending') {
  //     const compiler = compilerRef.current
  //     let success = false
  //     compiler.init().then(res => {
  //       console.log('COMPILER INIT RESULT:', res)
  //       setCopmilerstate('ready')
  //       success = true
  //     })
  //     const tid = setTimeout(() => {
  //       if (!success) setCopmilerstate('failed')
  //     }, 2500)
  //     return () => clearTimeout(tid)
  //   }
  // }, [compilerState])

  // useEffect(() => {
  //   if (compilerState === 'failed') {
  //     setCopmilerstate('pending')
  //   }
  // }, [compilerState])

  return (
    <StyledPanes split="vertical" minSize={380} defaultSize={640}>
      <MonacoEditor
        onMount={onEditorMounted}
        onChange={onEditorChange}
     />
     <StyledCompanionPane offset={offset}>
      <div className='content'>
        The other pane
        <pre>
          {JSON.stringify(offset, 1, 1)}
        </pre>
      </div>
     </StyledCompanionPane>
    </StyledPanes>
  )
}

const StyledCompanionPane = styled.div`
  --overall-height: 120;
  --scroll-top: 0;

  position: relative;
  > .content {
    position: relative;
    height: ${({offset}) => offset.scrollHeight}px;
    top: ${({offset}) => offset.scrollTop * -1}px;
  }
`

const StyledPanes = styled(SplitPane)`
.Resizer {
  background: #000;
  opacity: 0.2;
  z-index: 1;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -moz-background-clip: padding;
  -webkit-background-clip: padding;
  background-clip: padding-box;
}

.Resizer:hover {
  -webkit-transition: all 2s ease;
  transition: all 2s ease;
}

.Resizer.horizontal {
  height: 11px;
  margin: -5px 0;
  border-top: 5px solid rgba(255, 255, 255, 0);
  border-bottom: 5px solid rgba(255, 255, 255, 0);
  cursor: row-resize;
  width: 100%;
}

.Resizer.horizontal:hover {
  border-top: 5px solid rgba(0, 0, 0, 0.5);
  border-bottom: 5px solid rgba(0, 0, 0, 0.5);
}

.Resizer.vertical {
  width: 11px;
  margin: 0 -5px;
  border-left: 5px solid rgba(255, 255, 255, 0);
  border-right: 5px solid rgba(255, 255, 255, 0);
  cursor: col-resize;
}

.Resizer.vertical:hover {
  border-left: 5px solid rgba(0, 0, 0, 0.5);
  border-right: 5px solid rgba(0, 0, 0, 0.5);
}
.Resizer.disabled {
  cursor: not-allowed;
}
.Resizer.disabled:hover {
  border-color: transparent;
}
`



export default Djot
