import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Input } from 'antd'
import { mdiNoteTextOutline } from '@mdi/js'
import AntIconMDI from 'djitsu/components/anticon-mdi'

import Tool from 'mods/editorjs/tools/react-tool/tool.component'
import toolMaker from 'mods/editorjs/tools/react-tool/tool-maker'

const NamedToolComponent = (props) => {
  const { onChange, data } = props
  const [inputValue, setInputValue] = useState(data?.inputValue)

  const inputChanged = useCallback((e) => {
    const {
      target: { value }
    } = e
    setInputValue(value)
  }, [])

  useEffect(() => {
    console.log('Value updated:', inputValue, { onChange })
    if (inputValue !== data) onChange?.({ inputValue })
  }, [inputValue])

  return (
    <StyledTool placeholder='Content name...'>
      <Tool.View
        name='input'
        label='Input'
        description='Input...'
        icon={<AntIconMDI path={mdiNoteTextOutline} />}
      >
        <Input.TextArea rows={4} onChange={inputChanged} value={inputValue} />
      </Tool.View>
    </StyledTool>
  )
}

const StyledTool = styled(Tool)`
  & + .block-meta {
    top: -6px;
    border: 3px solid #0f0;
  }
`

const ICON = `<svg style="width:24px;height:24px" viewBox="0 0 24 24">
<path fill="currentColor" d="M21.4 11.6L12.4 2.6C12 2.2 11.5 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.5 2.2 12 2.6 12.4L11.6 21.4C12 21.8 12.5 22 13 22C13.5 22 14 21.8 14.4 21.4L21.4 14.4C21.8 14 22 13.5 22 13C22 12.5 21.8 12 21.4 11.6M13 20L4 11V4H11L20 13M6.5 5C7.3 5 8 5.7 8 6.5S7.3 8 6.5 8 5 7.3 5 6.5 5.7 5 6.5 5M10.1 8.9L11.5 7.5L17 13L15.6 14.4L10.1 8.9M7.6 11.4L9 10L13 14L11.6 15.4L7.6 11.4Z" />
</svg>`

export const namedContentTool = (blockName, options = {}) =>
  toolMaker(NamedToolComponent, blockName, { icon: ICON, ...options })

export default namedContentTool
