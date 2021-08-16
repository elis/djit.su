import React, { useCallback, useEffect, useState } from 'react'

// import AceEditor from 'react-ace'
import { mdiPresentation } from '@mdi/js'
import Icon from '@mdi/react'

import { Tool } from '../../editorjs-react-tool' // 'editorjs-react-tool'

import AntIcon, { CodeOutlined } from '@ant-design/icons'
import styled from 'styled-components'
import MonacoEditor from '../../../../djitsu/components/monaco-editor'

export const ViewDemoCode = props => {
  const { baseEditorProps = {}, input, onChange, errors } = props
  const [annotations, setAnnotations] = useState()

  const onChangeInput = useCallback(value => {
    // eslint-disable-next-line no-unused-expressions
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
      name="demo"
      icon={
        input ? (
          <CodeOutlined />
        ) : (
          <AntIcon
            component={() => (
              <Icon path={mdiPresentation} color="inherit" size="1em" />
            )}
          />
        )
      }
      label="Demo Code"
      description="Demo code..."
    >
      <EditorContainer style={{'--editor-height': '80px'}}>
        <MonacoEditor
          code={input}
          path='demo.jsx'
          onSave={val => {
            console.log('saving', val)
          }}
          onSaveAs={newData => console.log('save as', newData, true)}
          onMount={() => console.log('mounted')}
          onScroll={() => console.log('scrolled')}
          onChange={onChangeInput}
        />
      </EditorContainer>
    </Tool.View>
  )
}

const AceEditor = () => {
  return (
    <>
      <span>Mock Editor</span>
    </>
  )
}

const EditorContainer = styled.div`
  border-left: 1px solid var(--separator-color);
  border-right: 1px solid var(--separator-color);
`
export default ViewDemoCode
