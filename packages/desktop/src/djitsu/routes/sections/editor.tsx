import React from 'react'
import styled from 'styled-components'
import { Editor, DefaultDocument } from '../../../modules/adapters/editorjs'
import { useLayoutSettings } from '../../layout/hooks'

// const DefaultDocument = {}
// const Editor = ({ data }: { data: unknown }) => (
//   <>Mock Editor {data ? 'Data!' : 'No data.'}</>
// )

export const DjitsuEditorOld: React.FC = () => {
  useLayoutSettings({
    sidebar: false,
    breadcrumbs: false,
    noPadding: false
  })

  console.log('🥑 WHAT IS React @ Desktop!', React)
  return (
    <Container>
      <Editor data={DefaultDocument} />
    </Container>
  )
}

const Container = styled.div``

export default DjitsuEditorOld
