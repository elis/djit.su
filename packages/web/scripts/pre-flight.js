const { readFile } = require('fs')
const package = require('../package.json')
const chalk = require('chalk')

const Complete = () => {
  console.log(derm, 'Preflight complete.')
  process.exit(0)
}
const Abort = () => {
  console.log(derm, 'Aborting.')
  process.exit(1)
}

const derm = `[ ${chalk.blue('⟑')} ]`
const log = (...rest) => console.log(' '.repeat(5), ...rest)

if (!package.dv) {
  console.log(
    derm,
    `${chalk.redBright(
      'Error'
    )}: Missing Djistu Version ("dv") from package.json!`
  )
  log(
    `Add ${chalk.yellowBright(`"dv": "lion",`)} to your ${chalk.magentaBright(
      'package.json'
    )} file.`
  )
  Abort()
}

const init = async () => {
  console.log('')
  console.log(derm, "Djitsu — It's in the code.\n")
  log(
    'Initializing system...',
    chalk.green(package.dv.toUpperCase()),
    chalk.blueBright(`v${package.version}`)
  )
  console.log('')

  const hasEnvs = await checkEnvFile()
  const createEnvsTask = 'envs'

  const tasks = {}
  var Multispinner = require('multispinner')

  if (!hasEnvs) {
    tasks[createEnvsTask] = {
      task: async () => {
        await createDefaultEnvs()
        return true
      },
      desc: `Creating base ${chalk.magenta('.env.development.local')} file...`
    }
  }

  const spinners = Object.entries(tasks).reduce(
    (acc, [label, { desc }]) => ({ ...acc, [label]: desc }),
    {}
  )

  if (Object.keys(spinners).length) {
    const m = new Multispinner(spinners)
    Object.entries(tasks).map(([name, { task }]) =>
      task()
        .then(() => m.success(name))
        .catch(() => m.error())
    )

    m.on('success', () => {
      Complete()
    }).on('err', (e) => {
      Abort()
    })
  } else {
    Complete()
  }
}

const createDefaultEnvs = () =>
  makeBaseEnv(
    '.env.development.local',
    { ...require('./templates/base-env.json'), dv: package.dv },
    'RAZZLE'
  )

const makeBaseEnv = async (filename, values, prefix) => {
  const output =
    Object.entries(values)
      .map(([key, value]) => `${prefix}_${key.toUpperCase()}="${value}"`)
      .join('\n') + '\n'

  const { writeFileSync } = require('fs')

  writeFileSync(filename, output)
}

const checkEnvFile = async () => {
  const envFiles = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.development.local'
  ]

  const results = (
    await Promise.all(
      envFiles.map(async (filename) => {
        const [error, file] = await new Promise((r) =>
          readFile(`${filename}`, 'utf8', (e, f) => r([e, f]))
        )
        return !(error || !file)
      })
    )
  ).reduce((result, item) => result || item, false)

  return results
}

init()
