/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { bootError, systemCommand, systemState } from '../state/atoms/system'
import { useIPCRenderer } from './ipc/renderer'

import { BootupData, SystemStatus } from '../schema/system'

export const SystemService: React.FC = props => {
  const { invoke } = useIPCRenderer()
  const [system, setSystem] = useRecoilState(systemState)
  const [systemCommandState, setSystemCommand] = useRecoilState(systemCommand)
  const [bootErrorState, setBootError] = useRecoilState(bootError)

  useEffect(() => {
    console.log('🏙 System Service Attaching', system)
    setSystem(v => ({ ...v, serviceAttached: true }))

    if (system.status === SystemStatus.Unavailable) {
      setSystem(v => ({ ...v, serviceAttached: true }))

      invoke('bootup')
        .then(async (result: BootupData) => {
          console.log('Bootstrap data result:', result)
          // DEBUG
          true &&
            Object.assign(result, {
              local: {
                third: {
                  path: '/Users/eli/projects/temp/f/eli.djot'
                }
              }
            })

          if (result?.local?.third?.path) {
            // openFile: result.third.path
            setSystemCommand({
              action: 'open-file',
              path: result.local.third.path
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
  }, [])

  return <></>
}

export const useSystem = () => useRecoilState(systemState)

export default SystemService
