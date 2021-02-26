export const parseNotebookURI = (str) => {
  const regex = /^@([a-z][a-z0-9-_]*)\/(([a-z0-9-_]*)|(([a-z][a-z0-9-_]*):(.*)))$/
  const matches = `${str}`.match(regex)
  const [, username, , nn, , notebook, version] = matches || []
  if (!username && (!nn || !notebook)) return false

  return {
    username,
    notebook: nn || notebook,
    version
  }
}
