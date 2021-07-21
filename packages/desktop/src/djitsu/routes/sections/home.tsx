import { Button, Table } from 'antd'
import React from 'react'
import { useHistory } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import styled from 'styled-components'
import YAML from 'yaml'
import { useLayoutSettings } from '../../layout/hooks'
import { systemStateData } from '../../state/selectors/system'

export const DjitsuHome: React.FC = props => {
  const { staticPath, status } = useRecoilValue(systemStateData)
  useLayoutSettings({
    sidebar: true,
    breadcrumbs: true,
    noPadding: false
  })

  const history = useHistory()
  return (
    <StyleLauncher>
      <h2>Hello to Home!</h2>

      <Button type="primary" onClick={() => history.push('/editor')}>
        Go to Editor
      </Button>
      <Button type="primary" onClick={() => history.push('/notebook/dabc')}>
        Go to Notebook ID
      </Button>
      <Button type="primary" onClick={() => history.push('/notebook//Users/eli/test.djitsu')}>
        Go to /notebook//Users/eli/test.djitsu
      </Button>
      <Button onClick={() => history.push('/djot')}>Djot Something</Button>
      <Button type="ghost" onClick={() => history.push('/clean')}>
        Clean
      </Button>
      <pre style={{ width: '100%', overflowX: 'auto' }}>
        {YAML.stringify({ staticPath, status, 'process.env': process.env })}
      </pre>
    </StyleLauncher>
  )
}

const StyleLauncher = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`

export default DjitsuHome
