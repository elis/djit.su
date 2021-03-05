import { ipcRenderer } from 'electron'

export const useIPCRenderer = () => {
  const invoke = (task: string, ...args: unknown[]) =>
    ipcRenderer.invoke(task, ...args)

  return { invoke }
}

export default useIPCRenderer
