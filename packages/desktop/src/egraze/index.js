export const cache = {}

/**
 * Get Egraze plugin API
 * @param {string} name
 * @returns exposed plugin API
 */
export const plugin = name => {
  if (!cache.initial.has(name))
    throw new Error(`No plugin API named "${name}" available`)
  return cache.initial.get(name)
}
