import React from 'react'
import styled from 'styled-components'
import * as editor from '@djitsu/editor'
import { useLayoutSettings } from '../../layout/hooks'

// console.log('WHAT IS EDITOR?', { Editor, DefaultDocument })
console.log('WHAT IS EDITOR?', editor)

const { Editor, DefaultDocument } = editor

// const DefaultDocument = {}
// const Editor = ({ data }: { data: unknown }) => (
//   <>Mock Editor {data ? 'Data!' : 'No data.'}</>
// )

export const DjitsuEditor: React.FC = () => {
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

export default DjitsuEditor
