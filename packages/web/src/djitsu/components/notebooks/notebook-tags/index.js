import React, { useCallback, useMemo, useState } from 'react'
import { AutoComplete, Button, Form, Space, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link } from 'djitsu/adapters/routes'
import styled from 'styled-components'

import { useNotebook } from 'djitsu/providers/notebook'

export const NotebookTags = (props) => {
  const { notebook, editable } = props

  const [, notebookActions] = useNotebook()
  const miniLimit = 5
  const [editing, setEditing] = useState()
  const [search, setSearch] = useState()
  const [selected, setSelected] = useState()
  const [showAll, setShowAll] = useState()
  const [adding, setAdding] = useState()

  const items = []
  const [result, setResult] = useState([...items])
  const tags = useMemo(() => [...(notebook?.properties?.tags || [])], [
    notebook?.properties?.tags
  ])

  const showInput = useCallback(() => {
    setEditing(true)
  }, [])

  const addTag = useCallback(async () => {
    setAdding(selected)
    const clean = selected.replace(/[^a-z0-9-_]/gi, '').toLowerCase()
    // ! Add tag
    await notebookActions.addNotebookTag(notebook.notebookId, clean)
    setEditing()
    setSelected()
    setSearch()
    setAdding()
  }, [selected])

  const removeTag = useCallback(async (tag) => {
    await notebookActions.removeNotebookTag(notebook.notebookId, tag)
  }, [])

  const handleSearch = useCallback((searchFor) => {
    setSearch(searchFor)
    if (searchFor) {
      const clean = searchFor.replace(/[^a-z0-9-_]/gi, '').toLowerCase()
      const re = new RegExp(clean, 'i')
      setResult([
        ...items.filter(
          ({ label, value }) => label.match(re) || value.match(re)
        )
      ])
    } else setResult([...items])
  }, [])

  const onSelect = useCallback(
    (select) => {
      setSelected(select)
      if (search && search !== select) setSearch()
    },
    [search]
  )

  // useEffect(() => {}, [notebooks])

  return (
    <StyledTags>
      {(tags?.length || editable) && <span>Tags: &nbsp;</span>}
      {tags.map((tag, i) =>
        i < miniLimit || showAll ? (
          <Tag
            key={`tag-${tag}`}
            closable={editable}
            onClose={(e) => {
              e.preventDefault()
              // ! Remove tag
              removeTag(tag)
              // setTags((v) => [...v.filter((e) => e !== tag)])
            }}
          >
            <Link to={`/notebooks/tags/${tag}`}>{tag}</Link>
          </Tag>
        ) : (
          <></>
        )
      )}
      {!showAll && tags.length > miniLimit && (
        <Button size='small' type='link' onClick={() => setShowAll(true)}>
          Show {tags.length - miniLimit} more
        </Button>
      )}

      {!editing && !!editable && (
        <Button size='small' onClick={showInput} className='site-tag-plus'>
          <PlusOutlined /> New Tag
        </Button>
      )}
      {!!editing && (
        <>
          <Form onFinish={addTag}>
            <Space>
              <AutoComplete
                style={{ minWidth: 120 }}
                onSearch={handleSearch}
                placeholder='input here'
                size='small'
                onChange={onSelect}
                disabled={adding}
                autoFocus
              >
                {result.map(({ value, label }) => (
                  <AutoComplete.Option key={value} value={value}>
                    {label}
                  </AutoComplete.Option>
                ))}
              </AutoComplete>
              <Button
                htmlType='submit'
                size='small'
                type={selected ? 'primary' : 'default'}
                disabled={adding}
              >
                Add
              </Button>
              <Button
                size='small'
                onClick={() => setEditing()}
                disabled={adding}
              >
                Cancel
              </Button>
            </Space>
          </Form>
        </>
      )}
    </StyledTags>
  )
}

NotebookTags.propTypes = {}

export const StyledTags = styled.section`
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.2em;

  .site-tag-plus {
    align-self: flex-end;
  }
`

export default NotebookTags
