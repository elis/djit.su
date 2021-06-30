export const compiler = async (files) => {
  console.log('THIS IS MARKDOWN COMPILER!', files)
  return {
    outputCode: 'moarkey downey!',
    exports: {
      x: 'z',
      V: 'Q'
    }
  }
}

export const extensions = ['md']

export default {
  compiler,
  extensions
}
