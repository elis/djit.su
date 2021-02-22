const pkg = require('../package.json')
const fs = require('fs')
const serialize = require('serialize-javascript')
const merge = require('lodash/merge')
const trim = require('lodash/trim')
const tpkgTemplate = require('./templates/deploy-package.json')
const indentString = require('indent-string')

const argv = require('yargs') // eslint-disable-line
  .command(
    'production',
    'Generate for production',
    (yargs) => {
      yargs.option('environment', {
        alias: 'e',
        type: 'string',
        description: 'Selet environment label',
        default: 'production'
      })
    },
    (argv) => {
      setTimeout(() => makeVersions(argv.environment), 2)
    }
  )
  .command('development', 'Generate for development', (argv) => {
    setTimeout(() => makeVersions(argv.environment), 2)
  })
  .command(
    'local',
    'Generate for local',
    (yargs) => {
      yargs.option('environment', {
        alias: 'e',
        type: 'string',
        description: 'Selet environment label',
        default: 'local'
      })
      yargs.option('local', {
        alias: 'l',
        type: 'boolean',
        description: 'Append ".local"',
        default: false
      })
    },
    (argv) => {
      setTimeout(() => makeVersions(argv.environment), 2)
    }
  )
  .command('load-env', 'Load environment variables', (argv) => {
    require('child_process')
      .execSync(`./scripts/load-env ${argv.environment}`)
      .toString()
  })
  .option('environment', {
    alias: 'e',
    type: 'string',
    description: 'Selet environment label',
    default: 'development'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .option('local', {
    alias: 'l',
    type: 'boolean',
    description: 'Use ".local" env filenames',
    default: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Override output path configuration',
    default: ''
  })
  .default('dev').argv

const envPaths = {
  production: './deploy',
  development: '.',
  local: '.'
}

const verbose = argv.verbose

// Handle no command issue from yargs
if (!argv._[0]) {
  setTimeout(() => makeVersions('development'), 2)
}

const makeVersions = (selector) => {
  const env = argv.environment
  const envstring =
    (env ? `.${env}` : '.development') + (argv.local ? '.local' : '')

  if (argv.verbose) console.log(`Env "${env}" initializing...`, envstring)

  if (selector === 'production') {
    transformPackage(argv.output || envPaths[env])
  }
  makeDotEnv(envstring, envPaths[env])
}

const bashOneLiner = (command) =>
  trim(require('child_process').execSync(command).toString())

const getGitHash = () => bashOneLiner('git rev-parse HEAD')

const getGitDescribe = () => bashOneLiner('git describe --always')

const transformPackage = (dirname = './deploy') => {
  const { devDependencies, scripts, name, license, ...package } = pkg
  if (verbose) console.log(`Transforming ${dirname}/package.json`)

  const hash = getGitHash()
  const shorthash = hash.match(/^(.{7})/)[1]
  const stats = {
    tag: getGitDescribe(),
    hash,
    shorthash
  }

  if (process.env.CI_NAME) {
    Object.assign(stats, {
      ciName: process.env.CI_NAME,
      ciBuildNumber: process.env.CI_BUILD_NUMBER,
      ciBuildUrl: process.env.CI_BUILD_URL
    })
  }

  const json = serialize(merge(tpkgTemplate, merge(stats, package)), {
    isJSON: true,
    space: 2,
    unsafe: true
  })
  if (verbose) console.log(`Transformed JSON object to write:`, json)

  console.log(bashOneLiner('echo $PWD'))
  console.log(bashOneLiner('ls -al'))
  fs.writeFileSync(`${dirname}/package.json`, json)
}
const makeDotEnv = (env, dirname) => {
  if (verbose) console.log(`Generating dot env file for`, { env, dirname })
  const package = JSON.parse(fs.readFileSync(`${dirname}/package.json`, 'utf8'))

  const hash = getGitHash()
  const tag = getGitDescribe()

  const vars = {
    VERSION: package.version,
    DV: package.dv,
    BUILD_URL: process.env.BUILD_URL || '/build_stats',
    BUILD_NUMBER: process.env.BUILD_NUMBER || 'NA',
    BUILD_CI: process.env.CI_NAME || 'localhost',
    HASH: hash,
    SHORT_HASH: hash.match(/^(.{7})/)[1],
    TAG: tag
  }

  const varred = toEnvVariables(vars, 'RAZZLE_')

  if (verbose)
    console.log(
      `file to write:`,
      `${dirname}/.env${env}`,
      '\ndata to write:\n',
      indentString(varred, 2)
    )
  fs.writeFileSync(`${dirname}/.env${env}`, varred)
}

const toEnvVariables = (obj, prefix = '') =>
  Object.entries(obj).reduce(
    (acc, [key, val]) => `${acc}${prefix}${key}=${val}\n`,
    ''
  )
