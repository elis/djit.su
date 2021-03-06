import { Button } from 'antd'
import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { DjotStatus, DjotType } from '../../../schema/djot'
import { SystemSpinner } from '../../../schema/system'
import { currentDjotId, djotEditor } from '../../../state/atoms/djot'
import { loadingStatus, systemLoading } from '../../../state/atoms/system'



export const useFileHandler = (props: Record<string, any>) => {
  const [currentId, setCurrentDjotId] = useRecoilState(currentDjotId)
  const [state, setDjotEditor] = useRecoilState(djotEditor(props.match.params.path))

  const [loadingState, setLoadingStatus] = useRecoilState(loadingStatus('file'))
  console.log('WE Using file handler:', props)
  console.log('djotEditorState:', state)

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
      console.log('WE GONNA LOAD THAT FILE!', state.path)
      setLoadingStatus({
        // message: <React.Fragment>
        //   <div>Loading file: {state.path}</div>
        //   <Button size='small' onClick={() => {
        //     console.log('Cancel 2 clicked!')
        //   }}>Cancel</Button>
        // </React.Fragment>,
        message: 'Loading file...',
        Message: () => (
          <React.Fragment>
            <div>Loading file: {state.path}</div>
            <div style={{textAlign: 'center', padding: '24px 0'}}>
              <Button
                size='small'
                // onClick={() => {
                //   console.log('Cancel 2 clicked!')
                // }}
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

  return {
    currentId,
    status: state.status,
    loading: loadingState
  }
}
