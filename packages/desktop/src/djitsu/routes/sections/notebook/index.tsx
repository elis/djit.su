import React from 'react'
import styled from 'styled-components'
import Editor from '../../../../modules/adapters/editorjs' // '../../../../modules/adapters/editorjs'
import { useLayoutSettings } from '../../../layout/hooks'
import { useTheme } from '../../../theme'
import DefaultDocument from './default-document'
// const DefaultDocument = {}
// const Editor = ({ data }: { data: unknown }) => (
//   <>Mock Editor {data ? 'Data!' : 'No data.'}</>
// )

export const DjitsuEditor: React.FC = () => {
  const [themeState] = useTheme()
  useLayoutSettings({
    sidebar: false,
    breadcrumbs: false,
    noPadding: false
  })

  console.log('🥑 WHAT IS React @ Desktop!', React)
  return (
    <Container>
      <Editor
        data={DefaultDocument}
        toolProps={{
          getTheme: () => themeState.theme,
          addErrorListener: () => () => {},
          addCompiledListener: () => {}
        }}
      />
    </Container>
  )
}

const Container = styled.div``

export default DjitsuEditor
