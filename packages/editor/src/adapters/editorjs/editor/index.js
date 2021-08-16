import React from 'react'

const Editor = (props) => {
  const val = React.useMemo(() => 'Smoosh!', [])
  console.log('🔖 WHAT IS React:', React)
  return (
    <React.Fragment>
      <h4>Mock Editor.</h4>
      {val}
    </React.Fragment>
  )
}
export default Editor

// import EditorJS from 'react-editor-js'
// import * as ERT from 'editorjs-react-tool'
// import core from '@djitsu/core'
// import editorTools from './editor-tools'

// const liveCodeTool = () => ({})

// console.log('WHAT IS ERT?', ERT)

// const EditorJSAdapter = ({ data, toolProps }) => {
//   const componentTools = useMemo(
//     () => ({
//       // ...namedContentTool('dnamed', {
//       //   title: 'Named Content',
//       //   props: toolProps
//       // }),
//       ...liveCodeTool(core.block.BlockType.LiveCode, {
//         title: 'Live Code',
//         props: toolProps
//       })
//     }),
//     [toolProps]
//   )

//   return (
//     <EditorJS
//       data={data}
//       tools={{
//         ...componentTools,
//         ...editorTools
//       }}
//     />
//   )
// }

// export default EditorJSAdapter
