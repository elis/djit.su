import React, { useMemo } from 'react'
import htmlToReact from 'html-to-react'
import { StyledEditor } from './shared'

// ! Potential alternative: https://github.com/pavittarx/editorjs-html

export const StaticRenderer = (props) => {
  const { data = { blocks: [] } } = props

  const items = useMemo(
    () =>
      data.blocks.map((block, id) => (
        <StaticBlock key={`static-block-${id}`} {...block} />
      )),
    [data.blocks]
  )
  return (
    <StyledEditor>
      {items}
      <hr />
      Static rendering of {JSON.stringify(props, 1, 1)}
    </StyledEditor>
  )
}

const StaticBlock = (props) => {
  const { type: blockType, data = {} } = props

  const Comp =
    blockType in STATIC_BLOCKS
      ? STATIC_BLOCKS[blockType]
      : () => <>Unsupported block type: {blockType}</>

  return <Comp {...data} />
}

const STATIC_BLOCKS = {
  paragraph: ({ text }) => {
    const htmlToReactParser = new htmlToReact.Parser()
    // TODO: Sanitize paragraph allowed tags

    return <p>{htmlToReactParser.parse(text)}</p>
  },
  header: ({ text: _text, level }) => {
    const htmlToReactParser = new htmlToReact.Parser()
    const text = htmlToReactParser.parse(_text)
    const Comp =
      level === 1
        ? (props) => <h1 {...props}>{text}</h1>
        : level === 2
        ? (props) => <h2 {...props}>{text}</h2>
        : level === 3
        ? (props) => <h3 {...props}>{text}</h3>
        : level === 4
        ? (props) => <h4 {...props}>{text}</h4>
        : level === 5
        ? (props) => <h5 {...props}>{text}</h5>
        : level === 6
        ? (props) => <h6 {...props}>{text}</h6>
        : text
    return <Comp />
  }
}

export default StaticRenderer
