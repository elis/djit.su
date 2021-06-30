
import { writeFile, readFile } from 'fs/promises'
import YAML from 'yaml'

const myReadFile = async (event, filepath) => {
  console.log('read file:', filepath)
  const filedata = await readFile(filepath, { encoding: 'utf-8' })
  console.log('file data:', filedata)
  return ':)s'
}

const savePaneWidth = async (event, newWidth) => {
  const path = await import('path')
  const os = await import('os')
  const homedir = (await import('os')).homedir();
  const filepath = path.join(homedir, '.djitsurc')
  const settings = {}
  try {
    const settingsFile = await readFile(filepath, { encoding: 'utf-8' })
    console.log('settingsFile:', settingsFile)
    const parsed = YAML.parse(settingsFile)
    Object.assign(settings, parsed)
  } catch (error) {
    console.log('error reading settings', `${error}`)
  }

  settings.djotPaneWidth = newWidth
  const yamld = YAML.stringify(settings)
  try {
    await writeFile(filepath, yamld)
  } catch (error) {
    console.log('error writing file:', `${error}`)
  }
  return
}
try {
  const result = await myReadFile({}, '/Users/eli/projects/temp/f/eli.djitsu')
  console.log('result of read file:', result)

  // savePaneWidth({}, Math.floor(Math.random() * 1000))
} catch (error) {
  console.log('nope:', `${error}`)
}
