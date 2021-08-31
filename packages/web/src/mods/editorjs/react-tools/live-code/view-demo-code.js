import React, { useCallback, useEffect, useState, useRef } from 'react'

// import AceEditor from 'react-ace'
import { useMonaco } from '@monaco-editor/react'

import styled from 'styled-components'

import { mdiPresentation } from '@mdi/js'
import Icon from '@mdi/react'

import Tool from 'mods/editorjs/tools/react-tool/tool.component'

import AntIcon, { CodeOutlined } from '@ant-design/icons'

export const ViewDemoCode = (props) => {
  const { baseEditorProps = {}, input, onChange, errors } = props
  const [annotations, setAnnotations] = useState()

  const theme = baseEditorProps.theme
  const monaco = useMonaco()

  const editor = useRef()
  const glyphs = useRef()
  const containerDemo = useRef()

  const handleMoveCursor = () => {
    const lineToMoveTo = annotations[0].row + 1
    editor.current.setPosition({ column: 1, lineNumber: lineToMoveTo })
    editor.current.revealLine(lineToMoveTo)
    editor.current.focus()
  }
  const createMonaco = () => {
    editor.current = monaco.editor.create(containerDemo.current, {
      value: input,
      language: 'javascript',
      theme: theme === 'monokai' ? 'vs-dark' : 'vs-light',
      fontSize: 10,
      glyphMargin: true,
      wordWrap: 'wordWrapColumn',
      wordWrapColumn: 80,
      wordWrapMinified: true,
      automaticLayout: true,
      wrappingIndent: 'indent',
      height: 30
    })
  }

  const setOnChange = () => {
    editor.current.onDidChangeModelContent(function () {
      onChangeInput(editor.current.getValue())
    })
  }

  const setGlyphs = () => {
    if (!glyphs?.current) glyphs.current = []
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
      createMonaco()
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
    onChange?.(value)
  }, [])

  // useEffect(() => {
  //   console.log('¯¯¯¯˘˘˘¿¿ NEW ERROR:', errors)
  // }, [errors])

  useEffect(() => {
    // console.log('∂∂∂∂∂ CHANGED INPUT ERROR: ', input.error)
    if (errors) {
      const annot = [
        {
          row: (errors?.loc?.line ?? 1) - 1,
          column: (errors?.loc?.column ?? 1) - 1,
          text: errors?.message, // Or the Json reply from the parser
          type: 'error'
        }
      ]
      // console.log('∂∂∂∂∂ SETTING ANNOTATIONS: ', annot)
      setAnnotations(annot)
    } else setAnnotations()
  }, [errors])
  return (
    <Tool.View
      name='demo'
      icon={
        input ? (
          <CodeOutlined />
        ) : (
          <AntIcon
            component={() => (
              <Icon path={mdiPresentation} color='inherit' size='1em' />
            )}
          />
        )
      }
      label='Demo Code'
      description='Demo code...'
    >
      <MonacoContainer ref={containerDemo} />
      {annotations ? (
        <Error onClick={handleMoveCursor}>
          {annotations.text ? (
            `⚠️ line ${annotations[0].row + 1}: ${annotations[0].text}`
          ) : (
            <span>
              ⚠️ Demo Code box should only contain JSX. See{' '}
              <a href='https://djit.su/@elis/djitsu-101'>documentation</a>
            </span>
          )}
        </Error>
      ) : null}
    </Tool.View>
  )
}

const MonacoContainer = styled.div`
  height: 50px;
  padding: 0 !important;

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
  z-index: 1;
  width: 100%;

  code {
    background: grey;
    color: black;
  }
`

export default ViewDemoCode
