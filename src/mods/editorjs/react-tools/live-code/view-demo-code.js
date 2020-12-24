import React, { useCallback, useEffect, useState } from 'react'

import AceEditor from 'react-ace'
import { mdiPresentation } from '@mdi/js'
import Icon from '@mdi/react'

import Tool from 'mods/editorjs/tools/react-tool/tool.component'

import AntIcon, { CodeOutlined } from '@ant-design/icons'

export const ViewDemoCode = (props) => {
  const { baseEditorProps = {}, input, onChange, errors } = props
  const [annotations, setAnnotations] = useState()

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
      <AceEditor
        value={input}
        className='demo-editor'
        mode='jsx'
        {...baseEditorProps}
        setOptions={{
          ...baseEditorProps.setOptions,
          minLines: 2
        }}
        onChange={onChangeInput}
        // onLoad={onEditorLoad('input')}
        annotations={annotations}
        // markers={markers}
      />
    </Tool.View>
  )
}

export default ViewDemoCode
