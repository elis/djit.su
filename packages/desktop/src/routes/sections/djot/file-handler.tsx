import { Button } from 'antd'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useRecoilState, useRecoilStateLoadable, useRecoilValueLoadable } from 'recoil'
import { DjotStatus, DjotType } from '../../../schema/djot'
import { SystemSpinner } from '../../../schema/system'
import { currentDjotId, djotEditor } from '../../../state/atoms/djot'
import { loadingStatus, systemLoading } from '../../../state/atoms/system'

import { file } from '../../../state/atoms/files'
import useIPCRenderer from '../../../services/ipc/renderer'


export const useFileHandler = (props: Record<string, any>) => {
  const { invoke } = useIPCRenderer()
  const [currentId, setCurrentDjotId] = useRecoilState(currentDjotId)
  const [state, setDjotEditor] = useRecoilState(djotEditor(props.match.params.path))

  const [fileState, setFile] = useRecoilStateLoadable(file(state.path))
  const [loadingState, setLoadingStatus] = useRecoilState(loadingStatus('file'))

  useEffect(() => {
    if (props.match?.params?.type === 'file') {
      setDjotEditor({
        type: DjotType.File,
        path: props.match.params.path,
        status: DjotStatus.Unavailable
      })
      setCurrentDjotId(props.match.params.path)
    } else {
      setDjotEditor({
        type: DjotType.File,
        path: '',
        status: DjotStatus.Ready
      })
    }
  }, [])

  const cancelClick = () => {
    console.log('Cancel clicked!')
    setLoadingStatus(false)
    setDjotEditor(v => ({ ...v, status: DjotStatus.Ready}))
  }

  useEffect(() => {
    if (state.type === DjotType.File && state.status === DjotStatus.Unavailable) {
      setLoadingStatus({
        message: (
          <React.Fragment>
            <div>Loading file: {state.path}</div>
            <div style={{textAlign: 'center', padding: '24px 0'}}>
              <Button
                size='small'
                onClick={cancelClick}
              >Cancel</Button>
            </div>
          </React.Fragment>
          ),
        spinner: SystemSpinner.Rotate
      })
      setDjotEditor(v => ({ ...v, status: DjotStatus.Loading}))


      const tid = setTimeout(() => setLoadingStatus(false), 5000)
      return () => clearTimeout(tid)
    } else {
      console.log('WE NOT GONNA LOAD THAT FILE!', state)

    }
  }, [state])

  useEffect(() => {
    if (state.status === DjotStatus.Loading && fileState.state === 'hasValue') {
      setLoadingStatus(false)
      setDjotEditor(v => ({ ...v, status: DjotStatus.Ready}))
    }
  }, [fileState, state])

  const saveFile = useCallback(async (filepath: string, filedata: string) => {
    await invoke('write-file', filepath, filedata)
    setFile(v => ({ ...v, contents: filedata }))
  }, [])

  const setFileContents = useCallback(async (newData) => {
    console.log('What is state?', state)
    if (!state.path) throw new Error('No filepath set')
    await saveFile(state.path, newData)
  }, [state])

  const output = useMemo(() => ({
    currentId,
    contents: fileState.state === 'hasValue' && fileState.contents,
    status: state.status,
    loading: loadingState,

    setFileContents
  }), [
    currentId,
    fileState,
    state,
    loadingState,
    setFileContents
  ])

  return output
}
