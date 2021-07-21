import React, { useCallback, useMemo, useRef } from 'react'
import EditorJS from 'react-editor-js'
import { BlockType } from '../../core/schema/block'
import { liveCodeTool } from '../../mods/react-tools/live-code-tool'
import editorTools from './editor-tools'

const EditorJSAdapter = ({ data, toolProps, onReady }) => {
  const editorRef = useRef()
  // const source
  const componentTools = useMemo(
    () => ({
      // ...namedContentTool('dnamed', {
      //   title: 'Named Content',
      //   props: toolProps
      // }),
      ...liveCodeTool(BlockType.LiveCode, {
        title: 'Live Code',
        props: toolProps
      })
    }),
    [toolProps]
  )

  const editorReadyHandler = useCallback(editor => {
    editorRef.current = editor

    if (typeof onReady === 'function') onReady(editor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <EditorJS
      data={data}
      tools={{
        ...componentTools,
        ...editorTools
      }}
      onChange={(...args) => {
        console.log('📝', 'editor changed!', args)
      }}
      onReady={editorReadyHandler}
    />
  )
}

export default EditorJSAdapter
