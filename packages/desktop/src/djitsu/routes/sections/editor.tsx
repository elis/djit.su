import React from 'react'
import styled from 'styled-components'
// import { Editor, DefaultDocument } from '@djitsu/editor'
import { useLayoutSettings } from '../../layout/hooks'

const DefaultDocument = {}
const Editor = ({ data }: { data: unknown }) => (
  <>Mock Editor {data ? 'Data!' : 'No data.'}</>
)

export const DjitsuEditor: React.FC = () => {
  useLayoutSettings({
    sidebar: false,
    breadcrumbs: false,
    noPadding: false
  })

  return (
    <Container>
      <Editor data={DefaultDocument} />
    </Container>
  )
}

const Container = styled.div``

export default DjitsuEditor
