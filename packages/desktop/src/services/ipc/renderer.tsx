import { ipcRenderer } from 'electron'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil';
import { systemState } from '../../state/atoms/system';

export const useIPCRenderer = () => {
  const [system, setSystem] = useRecoilState(systemState)
  const invoke = (task: string, ...args: unknown[]) =>
    ipcRenderer.invoke(task, ...args)

  useEffect(() => {
    if (!system.booted)
      invoke('bootup')
        .then(result => {
          console.log('result of bootup:', result)
          setSystem({ ...result, booted: true })
        })

  }, [])

  return { invoke }
}

export default useIPCRenderer
