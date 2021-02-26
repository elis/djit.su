import _, { flatten, escapeRegExp } from 'lodash'

const MOD_CHAR = '|'
const MODARG_CHAR = ':'

const customMods = {
  length: (input) => input.length,
  entries: (input) => Object.entries(input),
  repeat: (input, times = 5) => `${input}`.repeat(times)
}

export const vonsole = (input, ...rest) => {
  const toConsole = rest[rest.length - 1] === CONSOLE_OUTPUT
  if (input.raw) {
    // const gmods = input[0].match(MOD_RE)
    // console.log("GMODS:', gmods", gmods)
    // we in tagged template, baby!
    const constructed = flatten(
      input.map((e, i) => {
        const next = rest[i]
        // if (next === CONSOLE_OUTPUT && toConsole) return []
        const me = e.replace(MOD_RE, '')
        const sib = input[i + 1]
        const modifier = typeof sib === 'string' && sib.match(MOD_RE)
        const mods = (modifier ? modifier[1].split(MOD_CHAR) : []).map((e) =>
          e.split(MODARG_CHAR)
        )

        const output = passthroughHandler(
          next === CONSOLE_OUTPUT ? '' : next,
          mods,
          toConsole
        )

        return [me, output]
      })
    )
    return toConsole
      ? _.map(constructed, (k) => (typeof k === 'string' ? k : k))
      : constructed.join('')
  }
  return input
}

vonsole.log = function () {
  const args = Array.prototype.slice.call(arguments)

  console.log.apply(console, [...vonsole(...args, CONSOLE_OUTPUT)])
}

const lodashMods = 'add, mean, ceil, floor, min, max, minBy, maxBy, round, sum, sumBy, get, keys, keysIn, omit, pick, result, toPairs, toPairsIn, values, valuesIn, camelCase, capitalize, deburr, endsWith, escape, escapeRegExp, kebabCase, lowerCase, lowerFirst, pad, padEnd, padStart, parseInt, repeat, replace, snakeCase, split, startCase, startsWith, toLower, toUpper, trim, trimEnd, trimStart, truncate, unescape, upperCase, upperFirst, words, defaultTo'.split(
  ', '
)

const passthroughHandler = (input, mods, tc) => {
  const ntype = typeof input

  if (mods && mods.length > 0) {
    const modified = mods.reduce((acc, [mod, ...args]) => {
      if (lodashMods.indexOf(mod) > -1) {
        return _[mod](acc, ...args)
      } else if (mod in customMods) {
        return customMods[mod](acc, ...args)
      }
    }, input)

    return passthroughHandler(modified, [], tc)
  }

  const output =
    ntype in typeHandler ? typeHandler[ntype](input, mods, tc) : input

  return output
}

const typeHandler = {
  object: (value, mods, tc) => {
    const modified = mods.reduce((acc, [mod, ...args]) => {
      if (lodashMods.indexOf(mod) > -1) {
        return _[mod](acc, ...args)
      } else if (mod in customMods) {
        return customMods[mod](acc, ...args)
      }
    }, value)

    if (tc) return modified
    if (Array.isArray(modified)) {
      return `[ ${modified
        .map((e) => passthroughHandler(e, [], tc))
        .join(', ')} ]`
    }
    return JSON.stringify(modified, 1, 1)
  }
}

const MOD_RE = new RegExp(
  `^${escapeRegExp(MOD_CHAR)}([a-z0-9-_${escapeRegExp(MOD_CHAR)}${escapeRegExp(
    MODARG_CHAR
  )}]+)`,
  'i'
)

const CONSOLE_OUTPUT = Symbol('console-output')
