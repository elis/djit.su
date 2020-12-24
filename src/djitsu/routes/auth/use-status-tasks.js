import useStates from 'djitsu/utils/hooks/use-states'

/**
 * Basic tasks management for UI progress/status screen
 *
 * Usage:
 *
 * ```jsx
 * const MyComp = (props) => {
 *  const [statusProps, { setTask, setTaskProgress }, resetTasks] = useStatusTasks({
 *    taskLabels: {
 *      label: 'Text to be displayed',
 *      verify: 'Verifying user activity',
 *      api: 'Access API servers'
 *    },
 *    taskDescriptions: {
 *      verify: 'Check that the user is well and active'
 *    },
 *    tasks: {
 *      verify: AuthStatus.STARTED,
 *      api: AuthStatus.PENDING
 *    }
 *  })
 *
 *  ...
 *
 *  useEffect(() => {
 *    ...
 *    setTask('verify', AuthStatus.PROGRESS)
 *    setTaskProgress('verify', 10)
 *    ...
 *
 *    setTaskProgress('verify', 100)
 *    setTask('verify', AuthStatus.COMPLETE)
 *    ...
 *  }, [])
 *
 *  return <AuthLayout.Status {...statusPropos} />
 * }
 * ```
 */
export const useStatusTasks = (opts = {}) => {
  const { taskLabels = {}, taskDescriptions = {}, tasks: baseTasks = {} } = opts

  const [myTasks, setMyTasks, resetMyTasks] = useStates({ ...baseTasks })
  const [myTasksProgress, setMyTasksProgress, resetMyTasksProgress] = useStates(
    {}
  )

  const resetAll = () => {
    resetMyTasks()
    resetMyTasksProgress()
  }

  const taskItems = [...Object.keys(myTasks)]

  const tasks = [...taskItems.map((e) => taskLabels[e])]
  const descriptions = [...taskItems.map((e) => taskDescriptions[e])]
  const status = [...taskItems.map((e) => myTasks[e])]
  const progress = [...taskItems.map((e) => myTasksProgress[e])]

  return [
    {
      descriptions,
      progress,
      status,
      tasks
    },
    {
      setTask: setMyTasks,
      resetTasks: resetMyTasks,

      setTaskProgress: setMyTasksProgress,
      resetTaskProgress: resetMyTasksProgress
    },
    resetAll
  ]
}

export default useStatusTasks
