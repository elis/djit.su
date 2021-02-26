import React, { useEffect, useState } from 'react'
import { useNotebook } from 'djitsu/providers/notebook'
import { NotebookError } from 'djitsu/schema/notebook'
import { Button, Result } from 'antd'
import { Link } from 'djitsu/adapters/routes'

// let HARD_LIMIT = 120
// let count = 0

export const useRestrictedFlow = (notebookId, notebookRevision) => {
  const [notebook] = useNotebook()

  const [[checkedId, checkedRevision], _setChecked] = useState([])
  const setChecked = (...idrev) => _setChecked(idrev)

  const [restricted, setRestricted] = useState()
  const [restrictedElm, setRestrictedElm] = useState()

  useEffect(() => {
    // console.groupCollapsed(
    //   `🐞🐡 Restricted Flow Check [${++count} / ${HARD_LIMIT}]`
    // )
    // if (count > HARD_LIMIT) {
    //   const reset = (newHardLimit) => {
    //     count = 0
    //     if (+newHardLimit) HARD_LIMIT = +newHardLimit
    //   }
    //   console.log(
    //     '🐞🐡 X. Reached hard limit - ABORTING - Invoke to reset: reset(hardLimit = 30)',
    //     reset
    //   )
    //   return
    // }
    // console.log('🐞🐡 1. Checking', { notebook, notebookId, notebookRevision })
    // console.log('🐞🐡 1.1. Checked', { checkedId, checkedRevision })
    const { error } = notebook.currentNotebook.notebook?.status || {}
    const state = {
      id: notebook.currentNotebook.notebookId,
      revision: notebook.currentNotebook.notebook?.meta?.revision
    }
    // console.log('🐞🐡 1.2. State', state)

    if (!checkedId) {
      // console.log('🐞🐡 2.1. No previously checked ID — Proceed to checking')
      setChecked(notebookId, notebookRevision)
    } else {
      // console.log('🐞🐡 2.2. Id previously checked', notebookId)
      // Has error
      if (error && !restricted) {
        // console.log('🐞🐡 2.2.1 Has error and not restricted', {
        //   error,
        //   restricted
        // })
        if (error === NotebookError.RevisionUnavailable) {
          // console.log('🐞🐡 2.2.1.1 Revision unavailable', {
          //   checkedRevision,
          //   stateRevision: state.revision,
          //   notebookRevision
          // })
          if (!state.revision && notebookRevision) {
            // console.log(
            //   '🐞🐡 2.2.1.2 State has no revision notebook has revision - Setting restricted',
            //   error
            // )
            setRestricted(error)
          }

          // State has revision - different from notebook revision
          else if (state.revision !== notebookRevision && notebookRevision) {
            // console.log(
            //   '🐞🐡 2.2.1.3 State has revision different from notebookRevision'
            // )
            setRestricted(error)
            setChecked(notebookId, notebookRevision)
          }

          // State has revision - notebook has not
          else if (state.revision && !notebookRevision) {
            // console.log(
            //   '🐞🐡 2.2.1.4 State has revision but notebook has no revision'
            // )
          }
        } else if (error === NotebookError.Restricted) {
          // console.log('🐞🐡 2.2.1.1 Notebook restricted', {
          //   checkedRevision,
          //   stateRevision: state.revision,
          //   notebookRevision
          // })
          setRestricted(error)
          setChecked(notebookId, notebookRevision)
        }
      } else if (error && restricted) {
        // console.log('🐞🐡 2.3. Has error and restricted', { error, restricted })
        if (
          error === NotebookError.RevisionUnavailable &&
          checkedRevision !== notebookRevision
        ) {
          // console.log('🐞🐡 2.3.1. Revision error - new revision', {
          //   checkedRevision,
          //   notebookRevision,
          //   error
          // })
          setRestricted(false)
          setChecked(notebookId, notebookRevision)
        }
      } else if (!error && restricted) {
        // console.log('🐞🐡 2.4. Has no error and restricted', {
        //   error,
        //   restricted
        // })
      } else if (!error && !restricted) {
        // console.log('🐞🐡 2.5. Has no error and not restricted')
      } else {
        // console.log('🐞🐡 2.5. Weird state')
      }
    }

    // console.groupEnd()
  }, [notebook, notebookId, notebookRevision, restricted])

  useEffect(() => {
    if (restricted) {
      const elm =
        restricted === NotebookError.Restricted ? (
          <Restricted403 />
        ) : (
          <Restricted404 documentId={notebookId} error={restricted} />
        )
      setRestrictedElm(elm)
    } else {
      setRestrictedElm(false)
    }
  }, [restricted])

  return [{ restricted, restrictedElm }, {}]
}

const Restricted404 = (props) => {
  const { documentId, error } = props
  return (
    <Result
      status='404'
      title={
        error === NotebookError.RevisionUnavailable ? (
          <>Revision unavailable</>
        ) : (
          <>Notebook unavailable</>
        )
      }
      subTitle={
        error === NotebookError.RevisionUnavailable ? (
          <>The revision you are trying to acces is not available</>
        ) : (
          <>The notebooke you are trying to access is not available</>
        )
      }
      extra={
        error === NotebookError.RevisionUnavailable ? (
          <>
            <Button type='primary'>
              <Link to={`/d${documentId}`}>Latest Revision</Link>
            </Button>
            <Button>
              <Link to='/'>Home</Link>
            </Button>
          </>
        ) : (
          <>
            <Button type='primary'>
              <Link to='/'>Home</Link>
            </Button>
          </>
        )
      }
    />
  )
}

const Restricted403 = () => {
  return (
    <Result
      status='403'
      title='Document Restricted'
      subTitle="The document you're trying to access is restricted or unavailable."
      extra={
        <>
          <Button type='primary'>
            <Link to='/'>Home</Link>
          </Button>
        </>
      }
    />
  )
}
