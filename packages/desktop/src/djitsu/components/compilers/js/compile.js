// Globals pre-loaded by Worker
import { compareVersions } from './Utils'
import Transitions from './Transitions'

// type Return = {
//   compiled: ?string,
//   compileErrorMessage: ?string,
//   envPresetDebugInfo: ?string,
//   meta: {
//     compiledSize: number,
//     rawSize: number,
//   },
//   sourceMap: ?string,
//   transitions: Array<Transition>,
// };

const DEFAULT_PRETTIER_CONFIG = {
  bracketSpacing: true,
  jsxBracketSameLine: false,
  parser: 'babel',
  printWidth: 80,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false
}

function guessFileExtension(presets) {
  let ext = '.js'
  if (presets.includes('typescript')) {
    ext = '.ts'
  }
  if (presets.includes('react')) {
    ext += 'x'
  }
  return ext
}

export default function compile(code, config) {
  const { envConfig, presetsOptions } = config

  let compiled = null
  let compileErrorMessage = null
  let envPresetDebugInfo = null
  let sourceMap = null
  let useBuiltIns = false
  let spec = false
  let loose = false
  let bugfixes = false
  let corejs = '3.6'

  // eslint-disable-next-line no-restricted-globals
  self.process = { env: {} }
  const Babel = require('@babel/standalone')
  const transitions = new Transitions()
  const meta = {
    compiledSize: 0,
    rawSize: new Blob([code], { type: 'text/plain' }).size
  }

  let presetEnvOptions = {}

  if (envConfig && envConfig.isEnvPresetEnabled) {
    const targets = {}
    const { forceAllTransforms, shippedProposals } = envConfig

    if (envConfig.browsers) {
      targets.browsers = envConfig.browsers
        .split(',')
        .map(value => value.trim())
        .filter(value => value)
    }
    if (envConfig.isElectronEnabled) {
      targets.electron = envConfig.electron
    }
    if (envConfig.isBuiltInsEnabled) {
      useBuiltIns = !config.evaluate && envConfig.builtIns
      if (envConfig.corejs) {
        corejs = envConfig.corejs
      }
    }
    if (envConfig.isNodeEnabled) {
      targets.node = envConfig.node
    }
    if (envConfig.isSpecEnabled) {
      spec = envConfig.isSpecEnabled
    }
    if (envConfig.isLooseEnabled) {
      loose = envConfig.isLooseEnabled
    }
    if (envConfig.isBugfixesEnabled) {
      bugfixes = envConfig.isBugfixesEnabled
    }

    presetEnvOptions = {
      targets,
      forceAllTransforms,
      shippedProposals,
      useBuiltIns,
      corejs,
      spec,
      loose
    }
    if (Babel.version && compareVersions(Babel.version, '7.9.0') !== -1) {
      presetEnvOptions.bugfixes = bugfixes
    }
  }

  try {
    const babelConfig = {
      babelrc: false,
      filename: `repl${guessFileExtension(config.presets)}`,
      sourceMap: config.sourceMap,

      presets: config.presets.map(preset => {
        if (typeof preset !== 'string') return preset
        if (preset === 'env') {
          return ['env', presetEnvOptions]
        }
        if (/^stage-[0-2]$/.test(preset)) {
          const decoratorsLegacy = presetsOptions.decoratorsLegacy
          const decoratorsBeforeExport = decoratorsLegacy
            ? undefined
            : presetsOptions.decoratorsBeforeExport

          return [
            preset,
            {
              decoratorsLegacy,
              decoratorsBeforeExport,
              pipelineProposal: presetsOptions.pipelineProposal
            }
          ]
        }
        if (preset === 'react') {
          return [
            'react',
            {
              runtime: presetsOptions.reactRuntime
            }
          ]
        }
        return preset
      }),
      plugins: config.plugins,
      sourceType: config.sourceType,
      wrapPluginVisitorMethod: config.getTransitions
        ? transitions.wrapPluginVisitorMethod
        : undefined
    }

    const transformed = Babel.transform(code, babelConfig)
    compiled = transformed.code

    if (config.getTransitions) {
      transitions.addExitTransition(compiled)
    }

    if (config.sourceMap) {
      try {
        sourceMap = JSON.stringify(transformed.map)
      } catch (error) {
        console.error(`Source Map generation failed: ${error}`)
      }
    }

    if (
      config.prettify &&
      typeof prettier !== 'undefined' &&
      typeof prettierPlugins !== 'undefined'
    ) {
      // TODO Don't re-parse; just pass Prettier the AST we already have.
      // This will have to wait until we've updated to Babel 7 since Prettier uses it.
      // Prettier doesn't handle ASTs from Babel 6.
      // if (
      //   prettier.__debug !== undefined &&
      //   typeof prettier.__debug.formatAST === 'function'
      // ) {
      //   compiled = prettier.__debug.formatAST(transformed.ast, DEFAULT_PRETTIER_CONFIG);
      // } else {
      compiled = prettier.format(compiled, {
        ...DEFAULT_PRETTIER_CONFIG,
        plugins: prettierPlugins
      })
      // }
    }
    meta.compiledSize = new Blob([compiled], { type: 'text/plain' }).size
  } catch (error) {
    compiled = null
    compileErrorMessage = error.message
    envPresetDebugInfo = null
    sourceMap = null
  }

  return {
    compiled,
    compileErrorMessage,
    envPresetDebugInfo,
    meta,
    sourceMap,
    transitions: transitions.getValue()
  }
}
