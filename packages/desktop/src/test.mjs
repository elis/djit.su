
import { writeFile, readFile } from 'fs/promises'
import YAML from 'yaml'

console.log('test')

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
  // savePaneWidth({}, Math.floor(Math.random() * 1000))
} catch (error) {
  console.log('nope:', `${error}`)
}
