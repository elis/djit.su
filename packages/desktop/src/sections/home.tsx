import { Button, Table } from 'antd'
import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useLayoutSettings } from '../layout/hooks'

export const DjitsuHome: React.FC = (props) => {
  useLayoutSettings({
    sidebar: true,
    breadcrumbs: true,
    noPadding: false
  })
  const history = useHistory()
  return (<StyleLauncher>
    <h2>Hello to Home!</h2>
    <Button type='primary' onClick={() => history.push('/editor')}>Go to Editor</Button>
    <Button onClick={() => history.push('/djot')}>Djot Something</Button>
    <Table dataSource={Object.entries(process.env).filter(([name]) => !name.match(/^npm/))} columns={[
      {title: 'Key', width: 220, ellipsis: true, render: (text) => <code>{text}</code>},
      {title: 'Value', render: (text) => <code>{text}</code>}
    ]} pagination={{pageSize: 1200}}/>
  </StyleLauncher>)
}


const StyleLauncher = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`

export default DjitsuHome
