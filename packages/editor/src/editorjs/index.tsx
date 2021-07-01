import * as React from 'react'
import EditorJS from 'react-editor-js'
import editorTools from './editor-tools'

export type EditorJSAdapterProps = {
  data: EditorJS.OutputData
}

const EditorJSAdapter: React.FC<EditorJSAdapterProps> = ({ data }) => {
  return <EditorJS data={data} tools={editorTools} />
}

export default EditorJSAdapter
