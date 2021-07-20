import React, { useCallback, useEffect, useState, useRef } from 'react'

import { useMonaco } from '@monaco-editor/react'

import prettier from 'prettier/standalone'
import babylon from 'prettier/parser-babel'

import styled from 'styled-components'

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

  const monaco = useMonaco()

  const editor = useRef()
  const glyphs = useRef()

  const closingTags = () => {
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

  const closingTagsFragment = () => {
    monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['>'],
      provideCompletionItems: (model, position) => {
        const codePre = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })

        const tag = codePre.match(`<`)?.[1]

        if (!tag) {
          return
        }

        const word = model.getWordUntilPosition(position)

        return {
          suggestions: [
            {
              label: `</>`,
              kind: monaco.languages.CompletionItemKind.EnumMember,
              insertText: `</>`,
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

  const createMonaco = () => {
    editor.current = monaco.editor.create(
      document.getElementById('Monaco-Container'),
      {
        value: codeInput,
        language: 'javascript',
        theme: theme === 'monokai' ? 'vs-dark' : 'vs-light',
        fontSize: 10,
        glyphMargin: true,
        wordWrap: 'wordWrapColumn',
        wordWrapColumn: 80,
        wordWrapMinified: true,
        wrappingIndent: 'indent'
      }
    )
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
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_K,
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_M
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

  useEffect(() => {
    if (monaco) {
      closingTags()
      // closingTagsFragment()
      createMonaco()
      addPrettier()
      setOnChange()
      setGlyphs()
    }
  }, [monaco])

  useEffect(() => {
    if (!editor.current) return

    if (!annotations) {
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

  return (
    <Tool.View
      name='main'
      label='Main Code'
      description='Main code...'
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
              (options.debug ? 'Disable ' : 'Enable ') + ' debuggin on block'
            }
          >
            <VButton onClick={toggleDebugCodeBlock} size='small'>
              {options.debug ? (
                <BugTwoTone
                  twoToneColor={[
                    'var(--error-color)',
                    'var(--tool-outline-color)'
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
      <MonacoContainer id='Monaco-Container' />
      {annotations ? (
        <Error onClick={handleMoveCursor}>
          ⚠️ line {annotations[0].row + 1}: {annotations[0].text}
        </Error>
      ) : null}
    </Tool.View>
  )
}

export default ViewCode

const MonacoContainer = styled.div`
  height: 110px;

  .myLineDecoration {
    background: #ea4639;
    width: 5px !important;
    margin-left: 3px;
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
  z-index: 99999999;
  width: 100%;
`
