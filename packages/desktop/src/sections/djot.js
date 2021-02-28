import React, { useCallback, useEffect, useRef, useState } from 'react'
import MonacoEditor from '../components/monaco-editor'
import { useLayoutState } from '../layout'
import { useLayoutSettings } from '../layout/hooks'
import { useMonaco } from '@monaco-editor/react'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'
import { useRecoilState } from 'recoil';
import { systemState } from '../state/atoms/system';
import objectHash from 'object-hash'

import JavascriptCompiler from '../components/compilers/js'

import WorkerApi from '../components/repl/WorkerApi'

export const Djot = (props) => {
  const [system, setSystem] = useRecoilState(systemState)
  const workerRef = useRef()
  const [compiled, setCompiled] = useState({})
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
  }

  const onEditorChange = async (newValue, { changes }) => {
    if (compilerRef.current) {
      const compiler = compilerRef.current

      const conf = {
        "plugins": [],
        "debugEnvPreset": false,
        "envConfig": {
          "browsers": "defaults, not ie 11, not ie_mob 11",
          "electron": "1.8",
          "isEnvPresetEnabled": true,
          "isElectronEnabled": false,
          "isNodeEnabled": false,
          "forceAllTransforms": false,
          "shippedProposals": false,
          "isBuiltInsEnabled": false,
          "isSpecEnabled": false,
          "isLooseEnabled": false,
          "isBugfixesEnabled": true,
          "node": "10.13",
          "version": "",
          "builtIns": "usage",
          "corejs": "3.6"
        },
        "presetsOptions": {
          "decoratorsLegacy": false,
          "decoratorsBeforeExport": false,
          "pipelineProposal": "minimal",
          "reactRuntime": "classic"
        },
        "evaluate": false,
        "presets": [
          "env",
          "react",
          "stage-2"
        ],
        "prettify": false,
        "sourceMap": false,
        "sourceType": "module",
        "getTransitions": false
      }
      const result = await compiler.compile(newValue, conf)
      result.source = newValue
      try {
        const ast = await compiler.walk(compiled.source, {
          sourceType: 'module'
        })
        result.ast = ast
      } catch (error) {
        result.parserErrorMessage = `${error}`
      }
      console.log('🧠 setting compiled:', result)
      setCompiled(result)
    }
  }

  useEffect(() => {
    if (compiled.compiled) {
      const compiler = compilerRef.current
      console.log('Now that it\'s compiled, let\'s execute!')
      const result = compiler.execute(compiled.compiled)
      console.log('executed code:', result)
    }
  }, [compiled])

  useEffect(() => {
    if (monaco?.editor) {
      monaco.editor.onDidCreateEditor((codeEditor) => {
        codeEditor.onDidScrollChange(onDidScroll)
      })
    }
  }, [editorRef.current, monaco])

  useEffect(() => {
    if (system.booted && !compilerRef.current && compilerState === 'offline') {
      const compiler = new JavascriptCompiler()
      compilerRef.current = compiler
      setCopmilerstate('pending')
    }
  }, [system.booted, compilerState])

  const [displayValue, setDisplayValue] = useState([])

  const buildDisplay = () => {
    if (compiled?.ast?.body?.length) {
      console.log('📜 AST Updated', compiled.ast)
      const { source, ast } = compiled
      const display = []
      const lines = []
      let chr = 0

      let line = []

      for (const node of ast.body) {
        console.log('the node we\'re visiting:', node)
        const prev = source.substr(chr, node.start - chr)
        console.log('🦷 Prev:', { prev })
        chr = node.end
        const body = source.substr(node.start, node.end - node.start)
        console.log('👂 Body:', { body })
        const prevNLs = (prev.match(/\n/g) || []).length
        const bodyNLs = (body.match(/\n/g) || []).length
        console.log('🦵 Newlines:', { prevNLs, bodyNLs })

        if (prevNLs) {
          const hasLine = line.length
          if (hasLine) {
            display.push(line)
            line = []
          }
          for (let i = 0; i < prevNLs - (hasLine ? 1 : 0); ++i) {
            display.push('')
          }
        }

        if (!bodyNLs) {
          line.push('+' + node.type)
        } else {
          for (let i = 0; i < bodyNLs; ++i) {
            console.log('Testing ', i, 'in bodyNLs', bodyNLs)
            if (!i) display.push('->' + node.type)
            else {
              display.push(']')
            }
          }
          if (!body.match(/\n$/)) {
            line.push('/' + node.type)
          }
        }


        // if (bodyNLs)
        //   for (let i = 0; i < bodyNLs; ++i) {
        //     console.log('Testing ', i, 'in bodyNLs', bodyNLs)
        //     if (!i) display.push('+' + node.type)
        //     else {
        //       if (i === bodyNLs - 1) display.push('/' + node.type)
        //       else display.push('')
        //     }
        //   }
        // else {
        //   display.push('+' + node.type)
        // }
      }
      if (line.length) {
        display.push([...line])
        line = []
      }
      if (chr < source.length) {
        const bodyNLs = (source.substr(chr).match(/\n/g) || []).length
        for (let i = 0; i < bodyNLs; ++i) {
          display.push('')
        }
      }
      console.log('📜🖥 AST Display Ready', display)
      setDisplayValue(display)
    }
  }

  const [lastCompiledHash, setLastCompiledHash] = useState('')
  useEffect(() => {
    if (compiled?.compiled) {
      console.log('👩‍🦰 compiled updated', compiled.compiled)
      const hash = objectHash({compiled: compiled.compiled, source: compiled.source})
      console.log('👩‍🦰 new hash', hash, 'old hash:', lastCompiledHash)
      if (lastCompiledHash !== hash) {
        console.log('👩‍🦰 setting hash to:', hash)
        setLastCompiledHash(hash)
      }
    }
  }, [compiled])
  useEffect(() => {
    if (lastCompiledHash) {
      buildDisplay()
    }
  }, [lastCompiledHash])

  return (
    <StyledPanes split="vertical" minSize={380} defaultSize={640}>
      <MonacoEditor
        onMount={onEditorMounted}
        onChange={onEditorChange}
     />
     <StyledCompanionPane offset={offset}>
      <div className='content'>
        {displayValue?.length > 0 && displayValue.map((row) => (
          <div className='line'>{row}&nbsp;</div>
        ))}
        <pre>{compiled.compiled}</pre>
        <pre>
          {JSON.stringify(compiled, 1, 1)}
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

    > .line {
      /* border: 1px solid #F0F; */
      position: relative;
      line-height: 1.5em;
      &::after {
        position: absolute;
        left: -100%;
        width: 200%;
        content: "";
        border-bottom: 1px solid #FF00FF33;
        bottom: 0;
      }

      &:hover {
        &::after {
          border-bottom-color: #00FFFF88;
        }
      }
    }
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
