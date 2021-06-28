/* eslint-disable import/no-unresolved */
/* eslint-disable import/no-webpack-loader-syntax */
/* eslint-disable no-underscore-dangle */
import scopedEval from './scopedEval'
import { registerPromiseWorkerApi } from './WorkerUtils'

const WorkerSource = require('worker-loader?inline=no-fallback&esModule=false!./Worker')

// const WorkerDirect = require("./Worker")

// type PromiseWorkerApi = {
//   postMessage(message: Object): Promise<any>
// }

// type CompileResult = {
//   compiled: ?string,
//   compileErrorMessage: ?string,
//   envPresetDebugInfo: ?string,
//   evalErrorMessage: ?string,
//   meta: Object,
//   sourceMap: ?string
// }

// type PluginShape = {
//   instanceName: string,
//   pluginName: string
// }

/**
 * Interfaces with a web worker to lazy-loads plugins and compile code.
 */
export default class WorkerApi {
  _worker

  constructor(options) {
    this.options = options
    this._worker = registerPromiseWorkerApi(new WorkerSource(true))
  }

  compile(code, config) {
    return this._worker
      .postMessage({
        code,
        method: 'compile',
        config
      })
      .then(
        ({
          compiled,
          compileErrorMessage,
          envPresetDebugInfo,
          meta,
          sourceMap,
          transitions
        }) => {
          let evalErrorMessage = null

          // Compilation is done in a web worker for performance reasons,
          // But eval requires the UI thread so code can access globals like window.
          if (config.evaluate) {
            try {
              scopedEval.execute(compiled, sourceMap)
            } catch (error) {
              evalErrorMessage = error.message
            }
          }

          return {
            compiled,
            compileErrorMessage,
            envPresetDebugInfo,
            evalErrorMessage,
            meta,
            sourceMap,
            transitions
          }
        }
      )
  }

  getBabelVersion() {
    return this._worker.postMessage({ method: 'getBabelVersion' })
  }

  loadExternalPlugin(url) {
    return this.loadScript(url)
  }

  getBundleVersion(name) {
    return this._worker.postMessage({ method: 'getBundleVersion', name })
  }

  getAvailablePresets() {
    return this._worker.postMessage({ method: 'getAvailablePresets' })
  }

  getAvailablePlugins() {
    return this._worker.postMessage({ method: 'getAvailablePlugins' })
  }

  loadPlugin(state) {
    const { config } = state

    const base = config.baseUrl || 'https://bundle.run'
    const url = `${base}/${config.package}@${config.version || ''}`

    state.isLoading = true

    const loadPromise = !config.files
      ? this.loadScript(url)
      : Promise.all(config.files.map(file => this.loadScript(`${url}/${file}`)))

    return loadPromise.then(success => {
      if (success) {
        state.isLoaded = true
        state.isLoading = false
      } else {
        state.didError = true
        state.isLoading = false
      }

      return success
    })
  }

  loadScript(url) {
    return this._worker.postMessage({
      method: 'loadScript',
      url
    })
  }

  registerEnvPreset() {
    return this._worker.postMessage({
      method: 'registerEnvPreset'
    })
  }

  registerPlugins(plugins) {
    return this._worker.postMessage({
      method: 'registerPlugins',
      plugins
    })
  }
}
