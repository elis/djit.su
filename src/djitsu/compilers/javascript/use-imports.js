import fromPairs from 'lodash/fp/fromPairs'
import * as d3require from './require'
import asyncFilter from 'djitsu/utils/async-filter'

const DEBUG = false

const sillyCache = {}

export const useImports = async (imports, loader, localImports) => {
  const aliases = fromPairs(
    await Promise.all(
      Object.entries(localImports).map(async ([name, imp]) => [
        name,
        await imp()
      ])
    )
  )

  DEBUG &&
    (console.group('⎔›› Use Imports') ||
      console.info('Imports:', imports) ||
      console.info('Local imports:', localImports) ||
      console.groupEnd())

  const newFoundModules = new Map()

  const localRequire = d3require.require.alias(aliases)

  const httpResolves = {}
  const manualResolves = {}

  const httpImporter = async (name) => {
    if (name in sillyCache) return sillyCache[name]
    try {
      const result = await localRequire(name)
      return result
    } catch (error) {
      if (window.exports && Object.keys(window.exports).length) {
        return window.exports
      }
    }
  }

  const sideload = async (name, test) => {
    if (name in sillyCache)
      return (
        sillyCache[name]?.module?.exports ||
        sillyCache[name]?.module ||
        sillyCache[name]
      )
    const res = await httpImporter(name, test)
    sillyCache[name] = res
    return res?.module?.exports || res?.module || res
  }

  const remoteImporter = async (name, test) => {
    if (test) {
      const result = await localRequire(name)
      if (result) {
        newFoundModules.set(name, result)
        return true
      }
    }
    if (!test) {
      return newFoundModules.get(name)
    }
  }

  const loaderImports = await asyncFilter(imports, (name) => loader(name, true))
  const httpImports = imports.filter((name) => name.match(/^https?:/))
  const remoteImports = await asyncFilter(
    imports
      .map((name) => name.match(/^\/\/(.*)$/))
      .filter((name) => name)
      .map(([, name]) => name),
    (name) => remoteImporter(name, true)
  )

  const loadedRemoteImports = await asyncFilter(
    imports
      .map((name) => name.match(/^\.\/(.*)$/))
      .filter((name) => name)
      .map(([, name]) => name),
    (name) => remoteImporter(name, true)
  )
  const installedImports = imports
    .filter((name) => remoteImports.indexOf(name.replace(/^\/\//, '')) === -1)
    .filter((name) => loaderImports.indexOf(name) === -1)
    .filter((name) => httpImports.indexOf(name) === -1)

  const foundImports = await asyncFilter(httpImports, (name) =>
    httpImporter(name, true)
  )

  DEBUG &&
    (console.group('⎔ Use Imports') ||
      console.info('loaderImports', loaderImports) ||
      console.info('httpImports', httpImports) ||
      console.info('remoteImports', remoteImports) ||
      console.info('loadedRemoteImports', loadedRemoteImports) ||
      console.info('installedImports', installedImports) ||
      console.info('foundImports', foundImports) ||
      console.groupEnd() ||
      console.group('⎔→ Resolved Imports') ||
      console.info('newFoundModules', newFoundModules) ||
      console.info('httpResolves', httpResolves) ||
      console.info('manualResolves', manualResolves) ||
      console.groupEnd())

  const resolvedImports = (
    await Promise.all([
      // HTTP imports
      await Promise.all(
        foundImports.map(async (name) => [name, await sideload(name)])
      ),

      // HTTP imports (Remote Imports)
      await Promise.all(
        remoteImports.map(async (name) => [name, await remoteImporter(name)])
      ),

      // Loaded HTTP imports (Remote Imports)
      await Promise.all(
        loadedRemoteImports.map(async (name) => [
          name,
          await remoteImporter(name)
        ])
      ),

      // Loader imports
      await Promise.all(
        loaderImports.map(async (name) => [name, await loader(name)])
      ),

      // Installed imports
      await Promise.all(
        installedImports.map(async (name) => [
          name,
          await localImports?.[name]?.()
        ])
      )
    ])
  )
    // .map((...arg) => console.log('Resolved imports mapper:', ...arg) || arg[0])
    .reduce((acc, imports) => [...acc, ...imports], []) // flatten the two arrays (http & installed)
    .reduce((acc, [name, value]) => ({ ...acc, [name]: value }), {})

  console.groupEnd()

  return resolvedImports
}
