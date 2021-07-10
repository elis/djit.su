import React, { useMemo } from 'react'
import EditorJS from 'react-editor-js'
import { BlockType } from '../../core/schema/block'
import { liveCodeTool } from '../../mods/react-tools/live-code-tool'
import editorTools from './editor-tools'

const EditorJSAdapter = ({ data, toolProps }) => {
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

  return (
    <EditorJS
      data={data}
      tools={{
        ...componentTools,
        ...editorTools
      }}
    />
  )
}

export default EditorJSAdapter
