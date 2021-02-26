import React, { useCallback, useEffect, useMemo, useState } from 'react'
import EditorJs from 'react-editor-js'

import { EDITOR_JS_TOOLS } from './editor-tools'
import compare from 'react-fast-compare'
import namedContentTool from 'mods/editorjs/react-tools/named-content'
import liveCodeTool from 'mods/editorjs/react-tools/live-code'
import { BlockType } from 'djitsu/schema/block'

export const EditorJSAdapter = (props) => {
  const { data, onChange: propsOnChange, toolProps } = props
  const [editorStarted, setEditorStarted] = useState()
  const [editorData, setEditorData] = useState()

  const onCompareBlocks = compare

  const componentTools = useMemo(
    () => ({
      ...namedContentTool('dnamed', {
        title: 'Named Content',
        props: toolProps
      }),
      ...liveCodeTool(BlockType.LiveCode, {
        title: 'Live Code',
        props: toolProps
      })
    }),
    [toolProps]
  )

  const onChangeNext = useCallback((editor, data) => {
    propsOnChange?.(data)
  }, [])

  const checkStart = useCallback(() => {
    if (data && !editorStarted) {
      setEditorStarted(true)
      setEditorData(data)
    }
  }, [data, editorStarted])

  useEffect(() => {
    if (data) checkStart()
  }, [data])

  return (
    <>
      {editorData && (
        <EditorJs
          data={editorData}
          tools={{ ...componentTools, ...EDITOR_JS_TOOLS }}
          onCompareBlocks={onCompareBlocks}
          onChange={onChangeNext}
        />
      )}
      {!editorData && 'Waiting for data...'}
    </>
  )
}

export default EditorJSAdapter
