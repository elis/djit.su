import { allowedInstalled, loaderMaker } from '.'
import { executeCode } from './executor'

const metas = new Map()
const queue = []
const map = queue.map
const some = queue.some
const hasOwnProperty = queue.hasOwnProperty
const origin = 'https://cdn.jsdelivr.net/npm/'
const identifierRe = /^((?:@[^/@]+\/)?[^/@]+)(?:@([^/]+))?(?:\/(.*))?$/
const versionRe = /^\d+\.\d+\.\d+(-[\w-.+]+)?$/
const extensionRe = /\.[^/]*$/
const mains = ['unpkg', 'jsdelivr', 'browser', 'main']

export class RequireError extends Error {
  constructor(message) {
    super(message)
  }
}

RequireError.prototype.name = RequireError.name

function main(meta) {
  for (const key of mains) {
    const value = meta[key]
    if (typeof value === 'string') {
      return extensionRe.test(value) ? value : `${value}.js`
    }
  }
}

function parseIdentifier(identifier) {
  const match = identifierRe.exec(identifier)
  return (
    match && {
      name: match[1],
      version: match[2],
      path: match[3]
    }
  )
}

function resolveMeta(target) {
  const url = `${origin}${target.name}${
    target.version ? `@${target.version}` : ''
  }/package.json`
  let meta = metas.get(url)
  if (!meta)
    metas.set(
      url,
      (meta = fetch(url).then((response) => {
        if (!response.ok) throw new RequireError('unable to load package.json')
        if (response.redirected && !metas.has(response.url))
          metas.set(response.url, meta)
        return response.json()
      }))
    )
  return meta
}

function getter(object, name) {
  return () => object[name]
}

function merge(modules) {
  const o = {}
  for (const m of modules) {
    for (const k in m) {
      if (hasOwnProperty.call(m, k)) {
        if (m[k] == null) Object.defineProperty(o, k, { get: getter(m, k) })
        else o[k] = m[k]
      }
    }
  }
  return o
}

function isbuiltin(name) {
  name = name + ''
  return name === 'exports' || name === 'module'
}
async function resolve(name, base) {
  if (name.startsWith(origin)) name = name.substring(origin.length)
  if (/^(\w+:)|\/\//i.test(name)) return name
  if (/^[.]{0,2}\//i.test(name))
    return new URL(name, base == null ? location : base).href
  if (!name.length || /^[\s._]/.test(name) || /\s$/.test(name))
    throw new RequireError('illegal name')
  const target = parseIdentifier(name)
  if (!target) return `${origin}${name}`
  if (!target.version && base != null && base.startsWith(origin)) {
    const meta = await resolveMeta(
      parseIdentifier(base.substring(origin.length))
    )
    target.version =
      (meta.dependencies && meta.dependencies[target.name]) ||
      (meta.peerDependencies && meta.peerDependencies[target.name])
  }
  if (target.path && !extensionRe.test(target.path)) target.path += '.js'
  if (target.path && target.version && versionRe.test(target.version))
    return `${origin}${target.name}@${target.version}/${target.path}`
  const meta = await resolveMeta(target)
  return `${origin}${meta.name}@${meta.version}/${
    target.path || main(meta) || 'index.js'
  }`
}

function define(name, dependencies, factory) {
  const n = arguments.length
  if (n < 2) (factory = name), (dependencies = [])
  else if (n < 3)
    (factory = dependencies),
      (dependencies = typeof name === 'string' ? [] : name)
  queue.push(
    some.call(dependencies, isbuiltin)
      ? (require) => {
          const exports = {}
          const module = { exports }
          return Promise.all(
            map.call(dependencies, (name) => {
              name = name + ''
              return name === 'exports'
                ? exports
                : name === 'module'
                ? module
                : require(name)
            })
          ).then((dependencies) => {
            factory.apply(null, dependencies)
            return module.exports
          })
        }
      : (require) => {
          return Promise.all(map.call(dependencies, require)).then(
            (dependencies) => {
              return typeof factory === 'function'
                ? factory.apply(null, dependencies)
                : factory
            }
          )
        }
  )
}

export function requireFrom(resolver) {
  const cache = new Map()
  let requireAbsolute
  let require
  function requireRelative(base) {
    return (name) => Promise.resolve(resolver(name, base)).then(requireAbsolute)
  }

  const requireBase = requireRelative(null)

  requireAbsolute = (url) => {
    if (typeof url !== 'string') return url
    let module = cache.get(url)
    if (!module)
      cache.set(
        url,
        (module = new Promise((resolve) => {
          const does = async () => {
            const request = await fetch(url)
            const code = await request.text()
            const loader = loaderMaker(
              (name, test) =>
                name in allowedInstalled &&
                ((!test && allowedInstalled[name]()) || true)
            )
            const result = await executeCode(code, {
              loader
            })

            // console.groupCollapsed('Code')
            // console.log(code)
            // console.groupEnd()
            // console.log('RESULT OF DOES 3:', result)
            resolve(result)
          }

          return does()
        }))
      )
    return module
  }

  function requireAlias(aliases) {
    let localResolver
    localResolver = requireFrom((name, base) => {
      if (name in aliases) {
        name = aliases[name]
        base = null
        if (typeof name !== 'string') return name
      }
      return resolver(name, base, localResolver)
    })
    return localResolver
  }

  require = (name) => {
    return arguments.length > 1
      ? Promise.all(map.call(arguments, requireBase)).then(merge)
      : requireBase(name)
  }

  require.alias = requireAlias
  require.resolve = resolver

  return require
}
export var require = requireFrom(resolve)

define.amd = {}
