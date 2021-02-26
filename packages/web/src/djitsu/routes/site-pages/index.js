import React from 'react'
import NotebookPage from 'djitsu/views/notebook-page'
import { useNotebook } from 'djitsu/providers/notebook'
import { importHandlerMaker } from 'djitsu/compilers/javascript'

export const SitePages = (props) => {
  const {
    match: {
      params: { section, page, exported }
    }
  } = props
  const [, notebookActions] = useNotebook()

  const isNotebook = async ({ username, notebookName, version }) => {
    try {
      await notebookActions.getNotebookId(notebookName, username, version)
      return true
    } catch {
      return false
    }
  }
  const getNotebook = async ({ username, notebookName, version }) => {
    try {
      const result = await notebookActions.getNotebookByName(
        notebookName,
        username,
        version
      )
      return result
    } catch (error) {
      console.log('error getting notebok:', error)
    }
  }

  const importLoader = importHandlerMaker({ isNotebook, getNotebook })

  if (!section) {
    // Load notebook id/name from config
    return (
      <div>
        <NotebookPage
          notebookName='main'
          notebookUsername='elis'
          exported={page}
          importHandler={importLoader}
        />
      </div>
    )
  } else if (section === 'elis') {
    return (
      <NotebookPage
        notebookName={page || 'import-works'}
        notebookUsername='elis'
        exported={exported || 'Main'}
        importHandler={importLoader}
      />
    )
  }

  return <>Site Page!</>
}

SitePages.propTypes = {}

export default SitePages
