import { ssr } from 'djitsu/utils/ssr'

const loaded = new Map()

/** @type {dependenciesLoader} */
export const dependenciesLoader = async (dependencies) => {
  const mappedDeps = Object.entries(dependencies).map(([name, loaders]) => [
    name,
    loaded.has(name)
      ? () => loaded.get(name)
      : async () => {
          const result = await loaders[ssr ? 'server' : 'client']()
          loaded.set(name, result)
          return result
        }
  ])
  const deps = (
    await Promise.all(
      mappedDeps.map(async ([name, loader]) => [name, await loader()])
    )
  ).reduce((acc, [name, dep]) => ({ ...acc, [name]: dep }), {})

  return deps
}

/** @type {clientLoader} */
export const clientLoader = async (src) => {
  const selfActions = {}
  const selfPromise = new Promise((resolve, reject) => {
    Object.assign(selfActions, { resolve, reject })
  })
  const onLoad = (result) => {
    selfActions.resolve(result)
  }

  const scripts = document.createElement('script')
  scripts.setAttribute('type', 'text/javascript')
  scripts.setAttribute('src', src)
  scripts.addEventListener('load', onLoad)
  document.body.appendChild(scripts)

  return selfPromise
}

export default dependenciesLoader

/**
 * @callback dependenciesLoader
 * @param {Record<DependencyName, CompilerDependency>} dependencies
 * @returns {Promise<Record<DependencyName, any>>}
 */
/**
 * @callback clientLoader
 * @param {String} src Source url to load
 * @returns {Promise<any>}
 */

/**
 * @typedef {String} DependencyName
 */

/**
 * @typedef {Object} CompilerDependency
 * @property {NotebookID} notebookId
 * @property {Block[]} blocks
 * @property {NotebookProperties} properties
 * @property {CompiledNotebook} compiled
 * @property {Timestamp} time
 */
