/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { bootError, systemCommand, systemState } from '../state/atoms/system'
import { useIPCRenderer } from './ipc/renderer'
import { BootupData, SystemStatus } from '../schema/system'

export const SystemService: React.FC = () => {
  const { invoke } = useIPCRenderer()
  const [system, setSystem] = useRecoilState(systemState)
  const [, setSystemCommand] = useRecoilState(systemCommand)
  const [, setBootError] = useRecoilState(bootError)

  useEffect(() => {
    console.log('🏙 System Service Attaching', system)
    const { search } = window.location
    const windowId = search
      .split('?')[1]
      .split('&')
      .map(el => el.split('='))
      .find(([field]) => field === 'id')?.[1]

    if (windowId) setSystem(v => ({ ...v, serviceAttached: true, windowId }))
    else throw new Error('WindowID is not defined')

    console.log('🏙 windowId:', windowId, 'System status:', system.status)

    if (
      system.status === SystemStatus.Unavailable ||
      system.status === SystemStatus.Ready
    ) {
      setSystem(v => ({ ...v, serviceAttached: true }))

      invoke('bootup', windowId)
        .then(async (result: BootupData) => {
          console.log('🏙 Bootstrap data result:', result)
          // DEBUG &&
          false &&
            !result?.local?.payload?.path &&
            Object.assign(result, {
              local: {
                action: 'open-file',
                payload: {
                  path: '/Users/eli/projects/temp/f/eli.djot'
                }
              }
            })

          if (result?.local?.action) {
            setSystemCommand({
              action: result.local.action,
              payload: result.local.payload
            })
          }

          await new Promise(resolve => setTimeout(resolve, 3000))
          setSystem(v => ({
            ...v,
            staticPath: result.staticPath,
            status: SystemStatus.Ready
          }))
        })
        .catch(error => {
          setBootError(error.toString())
          setSystem(v => ({ ...v, status: SystemStatus.Error }))
        })
    }

    return () => {
      console.log('🏙 System Service Dettaching', system)
      setSystem(v => ({ ...v, serviceAttached: false }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}

export const useSystem = () => useRecoilState(systemState)

export default SystemService
