import { LocalStorage } from 'node-localstorage'
import path from 'path'
import packageJSON from '../../../../package.json'

const homepath = path.join(process.env.HOME, '/', `.${packageJSON.name}`)
const storagePath = path.join(homepath, '/storage')
export const storage = new LocalStorage(storagePath)

export const loadUserSettings = () =>
  JSON.parse(storage.getItem('settings') || '{}')

export const saveUserSettings = settings =>
  storage.setItem('settings', JSON.stringify(settings))
