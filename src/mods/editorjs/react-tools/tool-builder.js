export const toolBuilder = (blockName, { toolClass, component, props }) => {
  return {
    [blockName]: {
      class: toolClass,
      config: {
        component,
        props
      }
    }
  }
}

export default toolBuilder
