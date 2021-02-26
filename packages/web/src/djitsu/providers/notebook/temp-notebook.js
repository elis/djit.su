import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * @returns {[TempNotebookState, TempNotebookActions]}
 */
export const useTempNotebook = () => {
  const localNotebook = useMemo(() => {
    try {
      const unsavedNotebook = JSON.parse(
        window.localStorage.getItem('unsaved-notebook')
      )
      return unsavedNotebook
    } catch {
      // noop
    }
    return undefined
  }, [])

  /** @type {[TempNotebook, React.Dispatch<any>]} */
  const [tempNotebook, setTempNotebook] = useState(localNotebook)

  /** @type {onNotebookChange} */
  const onNotebookChange = useCallback(
    async (notebookId, blocks, properties, compiled, time) => {
      // console.log('TEMP NOTEBOOK UPDATE...', {
      //   notebookId,
      //   blocks,
      //   properties,
      //   compiled,
      //   time
      // })
      if (blocks && blocks.length && time)
        setTempNotebook({ notebookId, blocks, properties, compiled, time })
      return true
    },
    []
  )

  /** @type {clearTemp} */
  const clearTemp = useCallback(() => {
    // console.log('⌛️⏳⌛️⏳⌛️⏳⌛️⏳⌛️ CLEARING TEMP...')
    setTempNotebook(null)
    clearChangesInLocalStorage()
  }, [])

  const keepChangesInLocalStorage = useCallback((toSave) => {
    const saveData = JSON.stringify(toSave)

    ;['unsaved-notebook', 'unsaved-notebook-backup'].map((e) =>
      window.localStorage.setItem(e, saveData)
    )
  }, [])

  const clearChangesInLocalStorage = useCallback(() => {
    window.localStorage.removeItem('unsaved-notebook')
  }, [])

  /** @type {clearBackup} */
  const clearBackupInLocalStorage = useCallback(() => {
    window.localStorage.removeItem('unsaved-notebook-backup')
  }, [])

  useEffect(() => {
    if (tempNotebook) keepChangesInLocalStorage(tempNotebook)
  }, [tempNotebook])

  return [
    { tempNotebook },
    {
      onNotebookChange,
      clearTemp,
      clearBackup: clearBackupInLocalStorage
    }
  ]
}

/**
 * @typedef {import('djitsu/schema/notebook').Notebook} Notebook
 * @typedef {import('djitsu/schema/notebook').NotebookProperties} NotebookProperties
 * @typedef {import('djitsu/schema/notebook').CompiledNotebook} CompiledNotebook
 * @typedef {import('djitsu/schema/notebook').NotebookID} NotebookID
 * @typedef {import('djitsu/schema/notebook').NotebookName} NotebookName
 * @typedef {import('djitsu/schema/notebook').NotebookVersion} NotebookVersion
 * @typedef {import('djitsu/schema/notebook').NotebookRevision} NotebookRevision
 * @typedef {import('djitsu/schema/user').Username} Username
 * @typedef {import('djitsu/schema/block').Block} Block
 * @typedef {import('djitsu/schema/generics').Timestamp} Timestamp
 */

/**
 * @callback onNotebookChange
 * @param {NotebookID} notebookId
 * @param {Blocks[]} blocks
 * @param {NotebookProperties} properties
 * @param {CompiledNotebook} compiled
 * @param {Timestamp} time
 * @returns {boolean}
 */

/**
 * @callback clearTemp
 * @returns {void}
 */

/**
 * @callback clearBackup
 * @returns {void}
 */

/**
 * @typedef {Object} TempNotebook
 * @property {NotebookID} notebookId
 * @property {Block[]} blocks
 * @property {NotebookProperties} properties
 * @property {CompiledNotebook} compiled
 * @property {Timestamp} time
 */

/**
 * @typedef {Object} TempNotebookState
 * @property {TempNotebook} tempNotebook
 */

/**
 * @typedef {Object} TempNotebookActions
 * @property {onNotebookChange} onNotebookChange
 * @property {clearTemp} clearTemp
 * @property {clearBackup} clearBackup
 */
