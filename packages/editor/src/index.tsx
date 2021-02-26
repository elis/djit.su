import * as React from 'react'
import styles from './styles.module.css'
import EditorJS from 'react-editor-js'
import editorTools from './misc/editor-tools'

interface Props {
  text: string
}

export const ExampleComponent = ({ text }: Props) => {
  return <div className={styles.test}>🦋🤯 Example Editor Component: {text}</div>
}

const data = {
  blocks: [
    {
      type: 'header',
      data: {
        text: 'Unnamed Notebook',
        level: 1
      }
    },
    {
      type: 'paragraph',
      data: {
        text: 'Type here...'
      }
    }
  ]
}

export const MyEditor = () => {
  return (
    <div className='my-editor'>
      <EditorJS
        data={data}
        tools={editorTools}
      />
    </div>
  )
}
