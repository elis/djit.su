import graze from 'graze'

/**
 *
 */
export const useOutput = (fn, timeout) => {
  return graze.exposed.useOutput(fn, timeout)
}

export default useOutput
