import React, { useCallback, useRef } from 'react'
import styled from 'styled-components'
import Editor from '#modules/adapters/editorjs' // '../../../../modules/adapters/editorjs'
import { Notebook } from '#modules/core/schema/notebook'
import { useNotebooks } from '../../../../egraze/plugins/egraze-notebooks/notebooks.context'
import { useLayoutSettings } from '../../../layout/hooks'
import { useTheme } from '../../../theme'
import DefaultDocument from './default-document'

export const DjitsuEditor = props => {
  const editorRef = useRef()
  const [themeState] = useTheme()
  const [notebooks, notebooksActions] = useNotebooks()

  const { notebookId, filepath } = props?.match?.params
  useLayoutSettings({
    sidebar: false,
    breadcrumbs: false,
    noPadding: false
  })

  const keyDownHandler = useCallback(
    async event => {
      const { ctrlKey, metaKey, keyCode } = event

      if ((ctrlKey || metaKey) && keyCode === 83) {
        console.log('💾💥', 'Saving!:', { filepath })
        const editorDoc = await editorRef.current.save()
        console.log('💾💥', 'Editor doc!:', editorDoc)
        const res = await notebooksActions.saveToFile({ editorDoc }, filepath)
        console.log('💾💥', 'Saved!:', res)
      }
      // console.log('event key downn:', { ctrlKey, metaKey, keyCode, event })
    },
    [filepath, notebooksActions]
  )

  const onEditorReadyHandler = useCallback(editor => {
    editorRef.current = editor
  }, [])

  console.log('🥑 Editor props:', props)
  return (
    <Container onKeyDown={keyDownHandler}>
      <Editor
        data={DefaultDocument}
        toolProps={{
          getTheme: () => themeState.theme,
          addErrorListener: () => () => {},
          addCompiledListener: () => {}
        }}
        onReady={onEditorReadyHandler}
      />
    </Container>
  )
}

const Container = styled.div``

export default DjitsuEditor
