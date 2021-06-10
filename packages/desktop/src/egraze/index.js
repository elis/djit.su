export const cache = {}

/**
 * Get Egraze plugin API
 * @param {string} name
 * @returns exposed plugin API
 */
export const plugin = name => {
  console.log('Plugin requested:', name, cache)
  if (!cache.apis?.[name])
    throw new Error(`No plugin API named "${name}" available`)
  return cache.apis[name]
}
