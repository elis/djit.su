import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { Menu, Popover } from 'antd'
// import ContentEditable from 'react-contenteditable'

export const NotebookEditor = () => {
  const [editableValue, setEditableValue] = useState('')
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const [selected, setSelected] = useState()
  // const onInputChanged = useCallback(({ target: { value } }) => {
  //   console.log('Out input value:', value)
  // }, [])
  const onEditableChange = useCallback(({ target: { value } }) => {
    console.log('Out editable value:', value)
    setEditableValue(value)
    if (value.match(/^\/\S*$/)) {
      const match = value.match(/^\/([\S]*)/)
      console.log('match:', match)
      setDropdownVisible(true)
    } else {
      setDropdownVisible(false)
    }
  }, [])

  const onKeyUp = useCallback(
    (event) => {
      console.log('Keyup event.keyCode:', event.keyCode)

      // LEFT: 37,
      // UP: 38,
      // RIGHT: 39,
      // DOWN: 40,
      if (event.keyCode === 40 && dropdownVisible) {
        // do thing
        console.log('KeyUP for 40!', selected)
        setSelected(selected ? (selected < 3 ? selected + 1 : selected) : 1)
        event.stopPropagation()
      } else if (event.keyCode === 38 && dropdownVisible) {
        // do thing
        console.log('KeyUP for 38!', selected)
        setSelected(selected ? (selected > 1 ? selected - 1 : selected) : 1)
        event.stopPropagation()
      } else if (event.keyCode === 13 && dropdownVisible) {
        event.stopPropagation()
        setDropdownVisible(false)
      }
    },
    [selected, dropdownVisible]
  )

  const menu = (
    <StyledMenu selectedKeys={selected ? [`item-${selected}`] : []}>
      <Menu.Item key='item-1'>1st menu item</Menu.Item>
      <Menu.Item key='item-2'>2nd menu item</Menu.Item>
      <Menu.Item key='item-3'>
        3rd menu item title # 3 is longer on purpose
      </Menu.Item>
    </StyledMenu>
  )
  return (
    <StyledNotebookEditor className='notebook-editor-page'>
      <h1>Hello Notebook!</h1>
      <Popover visible={dropdownVisible} content={menu} placement='bottomLeft'>
        {/* <ContentEditable
          // innerRef={this.contentEditable}
          html={editableValue} // innerHTML of the editable div
          disabled={false} // use true to disable editing
          onChange={onEditableChange} // handle innerHTML change
          tagName='article' // Use a custom HTML tag (uses a div by default)
          onKeyUp={onKeyUp}
        /> */}
      </Popover>
    </StyledNotebookEditor>
  )
}

NotebookEditor.propTypes = {}

const StyledNotebookEditor = styled.div`
  max-width: 1024px;
  margin: auto;
  border: 1px solid #f0f;
`

const StyledMenu = styled(Menu)`
  &.ant-menu {
    background: none;
  }
`

export default NotebookEditor
