const exposee = {}
const name = 'graze-djitsu'
export const server = {
  name,
  onRequest: () => ({}),
  pre: async (plugin, req, res) => {
    Object.assign(exposee, { req, res })
  }
}

export const app = {
  name,
  onLoad: () => ({}),
  Wrapper: ({ children }) => children,
  expose: () => ({ djj: exposee })
}
