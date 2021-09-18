import React, { useCallback, useEffect, useState, useRef } from 'react'

import { useMonaco } from '@monaco-editor/react'

import prettier from 'prettier/standalone'
import babylon from 'prettier/parser-babel'

import styled from 'styled-components'

import { Button } from 'antd'

import { Select, Tooltip } from 'antd'
import {
  mdiCodeBraces,
  mdiLanguageJavascript,
  mdiLanguageMarkdown,
  mdiLanguagePhp
} from '@mdi/js'
import Icon from '@mdi/react'
import AntIcon, { BugTwoTone, BugOutlined } from '@ant-design/icons'

import useStates from 'djitsu/utils/hooks/use-states'
import Tool from 'mods/editorjs/tools/react-tool/tool.component'
import { VButton } from 'mods/editorjs/tools/react-tool/tool-header'
import isEqual from 'react-fast-compare'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import compare from 'react-fast-compare'

export const ViewCode = (props) => {
  const { baseEditorProps = {}, input, onChange } = props
  const theme = baseEditorProps.theme

  const [codeInput, setCodeInput] = useState(input?.code)
  const [options, setOption] = useStates({
    language: 'js',
    ...(input.options || {})
  })

  const [annotations, setAnnotations] = useState()
  const [editorHeight, setEditorHeight] = useState(1)
  const [openModal, setOpenModal] = useState(false)
  const [promptType, setPromptType] = useState(null)
  const [promptValue, setPromptValue] = useState('')

  const monaco = useMonaco()

  const editor = useRef()
  const glyphs = useRef()
  const container = useRef()
  const modalInputRef = useRef()

  useEffect(() => {
    const lines = codeInput.split(/\r\n|\r|\n/).length
    const lineHeight = 13
    const minLines = 4
    const maxLines = 30
    if (lines < minLines) setEditorHeight(minLines * lineHeight)
    else if (lines > maxLines) setEditorHeight(maxLines * lineHeight)
    else setEditorHeight(lines * lineHeight)
    editor.current ? editor.current.layout() : null
  }, [codeInput])

  const suggestClosingTags = () => {
    monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['>'],
      provideCompletionItems: (model, position) => {
        const codePre = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })

        const tag = codePre.match(/.*<(\w+)>$/)?.[1]

        if (!tag) {
          return
        }

        const word = model.getWordUntilPosition(position)

        return {
          suggestions: [
            {
              label: `</${tag}>`,
              kind: monaco.languages.CompletionItemKind.EnumMember,
              insertText: `</${tag}>`,
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
              }
            }
          ]
        }
      }
    })
  }

  const clearPrompt = () => {
    setPromptType('')
    setPromptValue('')
  }

  const createMonaco = () => {
    editor.current = monaco.editor.create(container.current, {
      value: codeInput,
      language: 'javascript',
      theme: theme === 'monokai' ? 'vs-dark' : 'vs-light',
      fontSize: 10,
      glyphMargin: true,
      wordWrap: 'wordWrapColumn',
      wordWrapColumn: 80,
      wordWrapMinified: true,
      automaticLayout: true,
      wrappingIndent: 'indent'
    })
  }

  const format = () => {
    const options = {
      filepath:
        '/home/rick/Documents/Djitsu/djit.su/packages/web/src/mods/editorjs/react-tools/live-code/view-code.js',
      trailingComma: 'none',
      semi: false,
      singleQuote: true,
      tabWidth: 2,
      useTabs: false,
      printWidth: 80,
      jsxBracketSameLine: false,
      jsxSingleQuote: true
    }
    const formattedCode = prettier.format(editor.current.getValue(), {
      parser: 'babel',
      plugins: [babylon],
      ...options
    })

    const lastPos = editor.current.getPosition()

    editor.current.setValue(formattedCode)

    editor.current.setPosition(lastPos)

    setCodeInput(formattedCode)
  }

  const addPrettier = () => {
    editor.current.addAction({
      id: 'prettier',
      label: 'Prettierify The Code',
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_F,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_F
        )
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function () {
        format()
        return null
      }
    })
  }

  const setOnChange = () => {
    editor.current.onDidChangeModelContent(function () {
      editor.current.layout()
      onChangeInput(editor.current.getValue())
    })
  }

  const setGlyphs = () => {
    if (annotations) {
      const line = annotations[0].row + 1
      glyphs.current = editor.current.deltaDecorations(
        [],
        [
          {
            range: new monaco.Range(line, 1, line, 1),
            options: {
              isWholeLine: true,
              linesDecorationsClassName: 'myLineDecoration'
            }
          }
        ]
      )
    }
  }

  const tagWrap = () => {
    if (promptType !== 'TAGS') return
    const myTag = promptValue
    if (!myTag || myTag === '') return
    var selection = editor.current.getSelection()
    const { endColumn, endLineNumber, startColumn, startLineNumber } = selection
    if (startLineNumber === endLineNumber && startColumn === endColumn) return
    const range = new monaco.Range(
      startLineNumber,
      startColumn,
      startLineNumber,
      startColumn
    )
    const id = { major: 1, minor: 1 }
    const openingTag = `<${myTag}>`
    const closingTag = `</${myTag}>`
    const op = {
      identifier: id,
      range: range,
      text: openingTag,
      forceMoveMarkers: false
    }
    const range2 = new monaco.Range(
      endLineNumber,
      endColumn,
      endLineNumber,
      endColumn
    )
    const op2 = {
      identifier: id,
      range: range2,
      text: closingTag,
      forceMoveMarkers: false
    }
    editor.current.executeEdits('my-source', [op, op2])
    clearPrompt()
  }

  const showModal = () => {
    setOpenModal(true)
    modalInputRef.current.focus()
  }

  const addTagWrapper = () => {
    editor.current.addAction({
      id: 'tag-wrap',
      label: 'Add tag around selection',
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_B
        )
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function () {
        setPromptType('TAGS')
        showModal()
      }
    })
  }

  const addStyledComponent = () => {
    if (promptType !== 'STYLED') return
    if (promptValue === '') return
    const compName = promptValue.replace(/\s/g, '')
    const line = editor.current.getPosition()
    const range = new monaco.Range(line.lineNumber, 1, line.lineNumber, 1)
    const id = { major: 1, minor: 1 }
    const text = `export const ${compName} = styled.div\`\n\n\``
    const op = {
      identifier: id,
      range: range,
      text: text,
      forceMoveMarkers: true
    }
    editor.current.executeEdits('my-source', [op])
    format()
    clearPrompt()
  }

  const addReactComponent = () => {
    if (promptType !== 'REACT') return
    if (promptValue === '') return
    const compName = promptValue.replace(/\s/g, '')
    const line = editor.current.getPosition()
    const range = new monaco.Range(line.lineNumber, 1, line.lineNumber, 1)
    const id = { major: 1, minor: 1 }
    const text = `export const ${compName} = (props) => {\nreturn<></>\n}`
    const op = {
      identifier: id,
      range: range,
      text: text,
      forceMoveMarkers: true
    }
    editor.current.executeEdits('my-source', [op])
    format()
    clearPrompt()
  }

  const addReactComponentAdder = () => {
    editor.current.addAction({
      id: 'add-react-component',
      label: 'Add React component at position',
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_C,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_R
        )
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function () {
        setPromptType('REACT')
        showModal()
      }
    })
  }

  const addStyledAdder = () => {
    editor.current.addAction({
      id: 'add-styled-component',
      label: 'Add Styled component at position',
      keybindings: [
        monaco.KeyMod.chord(
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_C,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S
        )
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function () {
        setPromptType('STYLED')
        showModal()
      }
    })
  }

  useEffect(() => {
    if (monaco) {
      suggestClosingTags()
      createMonaco()
      addTagWrapper()
      addPrettier()
      setOnChange()
      setGlyphs()
      addReactComponentAdder()
      addStyledAdder()
    }
  }, [monaco])

  useEffect(() => {
    if (!editor.current) return

    if (!annotations) {
      if (!glyphs.current) return
      const targetId = glyphs.current[0]
      editor.current.deltaDecorations(
        [targetId],
        [
          {
            range: new monaco.Range(2, 1, 2, 1),
            options: {
              isWholeLine: true,
              className: '',
              linesDecorationsClassName: '',
              glyphMarginClassName: ''
            }
          }
        ]
      )
    }
  }, [annotations])

  const onChangeInput = useCallback((value) => {
    setCodeInput(value)
  }, [])

  const toggleDebugCodeBlock = useCallback(() => {
    setOption('debug', !options.debug)
  }, [options.debug])

  const changeBlockLanguage = useCallback((language) => {
    setOption('language', language)
  }, [])

  useEffect(() => {
    // console.log('∂∂∂∂∂ CHANGED INPUT VALUE TO: ', { options, codeInput })
    const areEqual = isEqual(
      { code: input?.code, options: input?.options },
      { options, code: codeInput }
    )
    // console.log('∂∂∂∂∂ CHANGED INPUT VALUE TO IS EQUAL: ', { areEqual })
    if (!areEqual) onChange?.({ options, code: codeInput })
  }, [options, codeInput])

  useEffect(() => {
    if (input?.options) {
      const isEqual = compare(input?.options, options)
      if (!isEqual) {
        setOption(input?.options)
      }
    }
  }, [input?.options])

  useEffect(() => {
    // console.log('∂∂∂∂∂ CHANGED INPUT ERROR: ', input.error)
    if (input.error) {
      const annot = [
        {
          row: (input.error?.loc?.line ?? 1) - 1,
          column: (input.error?.loc?.column ?? 1) - 1,
          text: input.error?.message, // Or the Json reply from the parser
          type: 'error'
        }
      ]
      // console.log('∂∂∂∂∂ SETTING ANNOTATIONS: ', annot)

      if (editor.current) {
        const line = annot[0].row + 1
        glyphs.current = editor.current.deltaDecorations(
          [],
          [
            {
              range: new monaco.Range(line, 1, line, 1),
              options: {
                isWholeLine: true,
                linesDecorationsClassName: 'myLineDecoration'
              }
            }
          ]
        )
      }

      setAnnotations(annot)
    } else setAnnotations()
  }, [input.error])

  const handleMoveCursor = () => {
    const lineToMoveTo = annotations[0].row + 1
    editor.current.setPosition({ column: 1, lineNumber: lineToMoveTo })
    editor.current.revealLine(lineToMoveTo)
    editor.current.focus()
  }

  const runAllPlugins = () => {
    tagWrap()
    addReactComponent()
    addStyledComponent()
  }

  const closeModal = () => {
    runAllPlugins()
    setOpenModal(false)
    clearPrompt()
  }

  const [isDragging, setIsDragging] = useState(false)
  const [initY, setInitY] = useState(0)

  const handleDragStart = (e) => {
    setInitY(e.clientY)
    setIsDragging(true)
  }

  const handleDrag = (e) => {
    if (!isDragging) return
    if (editorHeight - (initY - e.clientY) > 140)
      setEditorHeight(editorHeight - (initY - e.clientY))
    setInitY(e.clientY)
  }
  window.onmousemove = handleDrag

  const handleDragEnd = (e) => {
    if (!isDragging) return
    setIsDragging(false)
  }
  window.onmouseup = handleDragEnd

  const handleDoubleClick = () => {
    setEditorHeight(375)
  }
  return (
    <Tool.View
      onTop={true}
      name='main'
      label='Main Code'
      description={`# Main Code \n ## Here is where you write your main code \n ## Plugin HotKeys:\n ### Format JSX: **Ctrl+F+Ctrl+F**\n ### Create React Component at Cursor: **Ctrl+C+Ctrl+R**\n ### Create Styled Component at Curosr:**Ctrl+C+Ctrl+S**\n ### Wrap Selected Text in JSX Element: **Ctrl+B+Ctrl+B**`}
      icon={
        <AntIcon
          component={() => (
            <Icon path={mdiCodeBraces} color={'inherit'} size={'1em'} />
          )}
        />
      }
      actions={
        <>
          <Tooltip
            title={
              (options.debug ? 'Disable ' : 'Enable ') + ' debugging on block'
            }
          >
            <VButton onClick={toggleDebugCodeBlock} size='small'>
              {options.debug ? (
                <BugTwoTone
                  twoToneColor={[
                    'var(--error-color)',
                    'var(--separator-color)'
                  ]}
                />
              ) : (
                <BugOutlined />
              )}
            </VButton>
          </Tooltip>
          <Select
            size='small'
            bordered={false}
            value={options.language}
            onChange={(selected) => {
              changeBlockLanguage(selected)
            }}
          >
            <Select.Option value='js'>
              <AntIconMDI path={mdiLanguageJavascript} /> Javascript
            </Select.Option>
            <Select.Option value='md'>
              <AntIconMDI path={mdiLanguageMarkdown} /> Markdown
            </Select.Option>
            <Select.Option value='mdx'>
              <AntIconMDI path={mdiLanguagePhp} /> MDX
            </Select.Option>
          </Select>
        </>
      }
    >
      <Prompt style={!openModal ? { display: 'none' } : null}>
        <div>
          <h3>
            Enter{' '}
            {promptType === 'TAGS'
              ? 'tag type'
              : promptType === 'REACT'
              ? 'React component name'
              : promptType === 'STYLED'
              ? 'Styled div name'
              : '😕'}
          </h3>
          <input
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                closeModal()
              }
              if (e.key === 'Enter') {
                closeModal()
              }
            }}
            value={promptValue}
            onChange={(e) => setPromptValue(e.target.value)}
            ref={modalInputRef}
            autoFocus={true}
          />
          <Button
            type='primary'
            onClick={() => {
              closeModal()
            }}
          >
            OK
          </Button>
          <Button
            onClick={() => {
              closeModal()
            }}
          >
            Cancel
          </Button>
        </div>
      </Prompt>
      <MonacoContainer ref={container} height={`${editorHeight}px`} />
      {annotations ? (
        <Error onClick={handleMoveCursor}>
          ⚠️ line {annotations[0].row + 1}: {annotations[0].text}
        </Error>
      ) : null}
      <ResizeHandle
        onMouseDown={handleDragStart}
        onDoubleClick={handleDoubleClick}
      />
    </Tool.View>
  )
}

export default ViewCode

const ResizeHandle = styled.div`
  background: transparent;
  width: 100%;
  height: 2px;
  position: relative;
  top: 22px;
  cursor: ns-resize;
  z-index: 9999999;
`

const MonacoContainer = styled.div.attrs((props) => ({ props }))`
  height: ${(props) => props.height};

  .myLineDecoration {
    background: #ea4639;
    width: 5px !important;
    margin-left: 3px;
  }
`

const Prompt = styled.div`
  height: 100%;
  width: 100%;
  z-index: 99999;
  background: rgba(255, 255, 255, 0.9);
  position: absolute;
  top: 0;
  right: 0;

  div {
    position: absolute;
    top: 19%;
    right: 27%;
    h3 {
      color: black !important;
      font-family: Roboto !important;
    }
  }
`

const Error = styled.div`
  cursor: pointer;
  background: pink;
  padding: 0 0 0 10px !important;
  background: white;
  color: red;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  position: absolute;
  z-index: 1;
  width: 100%;
`
