import React, { useCallback, useEffect } from 'react'
import 'ssr-window'
import { ssr } from 'djitsu/utils/ssr'

const EditorComponent = ssr
  ? require('./static-renderer').default
  : require('./dynamic-renderer').default

export const DocumentEditor = (props) => {
  const { notebook, onChange: onChangeParent, importHandler } = props

  const onChange = useCallback((newValues) => {
    // console.log('🎀🎀☢️🎀🎀 EDITOR COMPONENT CHANGED:', newValues)
    return onChangeParent?.(newValues)
  }, [])

  const editorData = notebook
    ? {
        blocks: notebook.blocks,
        compiled: notebook.compiled,
        time: notebook.meta?.blocksTime,
        version: '2.18.0'
      }
    : {
        blocks: [],
        version: '2.18.0'
      }

  useEffect(() => {
    console.log('⎔♎︎ Document Editor Loaded', { props, editorData })
  }, [])

  return (
    <>
      {notebook && (
        <EditorComponent
          importHandler={importHandler}
          onChange={onChange}
          data={editorData}
        />
      )}
      {!notebook && <>Loading notebook...</>}
      {props.children}
    </>
  )
}

export default DocumentEditor
