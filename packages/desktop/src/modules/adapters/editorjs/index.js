import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import EditorJS from 'react-editor-js'
import { BlockType } from '#modules/core/schema/block'
import { liveCodeTool } from '#modules/mods/react-tools/live-code-tool'
import editorTools from './editor-tools'

/**
 * @type {React.Component<EditorJSAdapterProps>}
 */
const EditorJSAdapter = ({ data, toolProps, onReady }) => {
  const editorRef = useRef()

  const [oldTheme, setOldTheme] = useState(toolProps.getTheme())
  const [isUpdating, setIsUpdating] = useState(false)
  const [themeChanged, setThemeChanged] = useState(false)

  useEffect(() => {
    const newCurrentTheme = toolProps.getTheme()
    if (newCurrentTheme === oldTheme || themeChanged) return

    setThemeChanged(true)
    setIsUpdating(true)
  })

  useEffect(() => {
    if (isUpdating) {
      setIsUpdating(false)
      setThemeChanged(false)
      setOldTheme(toolProps.getTheme())
    }
  })

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
    <>
      {!isUpdating ? (
        <EditorJS
          data={data}
          tools={{
            ...componentTools,
            ...editorTools
          }}
          onReady={editorReadyHandler}
        />
      ) : null}
    </>
  )
}

export default EditorJSAdapter

/**
 * @typedef {JSX.Element<EditorJSAdapterProps>}
 */

/**
 * @typedef EditorJSAdapterProps
 * @property {object} data Data to invoke the editor with
 * @property {object} toolProps Properties passed on to tools
 * @property {OnEditorReady} onReady onReady handler
 */

/**
 * @callback OnEditorReady
 * @param {EditorJSInstance} editor EditorJS instance
 */
