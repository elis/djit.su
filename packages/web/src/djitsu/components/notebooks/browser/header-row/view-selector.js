import { mdiViewList, mdiViewModule } from '@mdi/js'
import { Radio, Tooltip } from 'antd'
import AntIconMDI from 'djitsu/components/anticon-mdi'
import React from 'react'

export const ViewSelector = (props) => (
  <Radio.Group value={props.selected} size='small' onChange={props.onChange}>
    <Tooltip title='List View'>
      <Radio.Button value='list' type='link'>
        <AntIconMDI path={mdiViewList} />
      </Radio.Button>
    </Tooltip>
    <Tooltip title='Tiled'>
      <Radio.Button value='tiled'>
        <AntIconMDI path={mdiViewModule} />
      </Radio.Button>
    </Tooltip>
  </Radio.Group>
)

export default ViewSelector
