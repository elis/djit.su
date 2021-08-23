import React, { useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { useMonaco } from '@monaco-editor/react'
import MonacoEditor from '../../../components/monaco-editor'
import Dropzone from 'react-dropzone'
import { Button, Divider, message, Tooltip, Input } from 'antd'
import { useTheme } from '../../../../djitsu/theme'
import { QuestionCircleOutlined } from '@ant-design/icons'
import themesConfig from '../../../../../src/dist/themes/themes.json'
import { convertTheme } from 'monaco-vscode-textmate-theme-converter'

const Wrap = styled.div`
  * {
    transition: all 0.1s ease-in-out;
  }
  display: flex;
  flex-direction: column;
  height: 99%;
  align-items: center;
  justify-content: end;
  .dropzone {
    height: 15vh;
    display: flex;
    align-items: center;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: ${props =>
      props.isDark ? '3px dashed white' : '3px dashed black'};
    color: white;
    padding: 100px 10px;
    width: 100%;

    div {
      display: flex;
      align-items: center;
      flex-direction: column;
    }
  }

  textarea {
    resize: none;
    height: 20vh;
    width: 20vw;
  }

  svg {
    margin-top: 13px;
    font-size: 20px;
    color: ${props => (props.isDark ? 'white' : 'black')};
    cursor: pointer;

    &:hover {
      opacity: 0.6;
    }
  }

  .preview {
    width: 100%;
    opacity: ${props => (props.showPreview ? 1 : 0)};
  }

  .theme-details {
    width: 70%;
    display: flex;
    flex-direction: column;
    .buttons {
      display: flex;
    }
  }
`

export default function ThemeImporter() {
  const editorRef = useRef()
  const monaco = useMonaco()
  const dropzoneRef = useRef()
  const [theme, themeActions] = useTheme()
  const [isDark, setIsDark] = useState(true)
  const [fileDropped, setFileDropped] = useState(false)
  const [newThemeDetails, setNewThemeDetails] = useState({})

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
  }

  function updateTheme() {
    if (monaco && editorRef.current) {
      try {
        monaco.editor.defineTheme(
          'my-theme',
          JSON.parse(editorJsonRef.current.value)
        )
        setError(null)
      } catch (error) {
        console.log(error)
        setError(error)
      }

      monaco.editor.setTheme('my-theme')
    }
  }

  useEffect(() => {
    const themeNow = theme.theme
    const themes = theme.availableThemes
    let isDark
    themes.forEach(item => {
      const name = item.name
      if (name === themeNow) {
        isDark = item.isDark
      }
    })
    setIsDark(isDark)
  }, [theme])

  function IsJsonString(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  function acceptFile(file) {
    console.log(file)
    dropzoneRef.current.style.opacity = '1'
    if (file.length > 1) {
      message.error('Only drop one file')
      return
    }
    file.forEach(file => {
      var fr = new FileReader()
      let read
      fr.onload = function (e) {
        read = e.target.result
        if (IsJsonString(read)) {
          const themeName = file.name.split('.')[0]
          const themeAsJSON = JSON.parse(read)
          console.log(convertTheme(themeAsJSON))
          setNewThemeDetails({ name: themeName, json: themeAsJSON })
          setFileDropped(true)
        } else {
          message.error('Not a valid JSON file')
        }
      }
      fr.readAsText(file)
    })
  }

  const myValue = `// comments \n text \n const x = 55 \n let You = \`Hello \$\{world\}\` \n import React from 'react'\n const Main=()=>{\n  return <>\n     <h1>Hello World</h1>\n </>\n}`

  return (
    <Wrap id="Import-Theme-Wrap" isDark={isDark} showPreview={fileDropped}>
      <h3>Import New Theme </h3>
      {!fileDropped ? (
        <>
          <Divider plain>Import Theme Via JSON</Divider>
          <Dropzone
            onDragEnter={() => (dropzoneRef.current.style.opacity = '0.2')}
            onDragLeave={() => (dropzoneRef.current.style.opacity = '1')}
            onDrop={acceptedFiles => acceptFile(acceptedFiles)}
          >
            {({ getRootProps, getInputProps }) => (
              <div className="dropzone" {...getRootProps()}>
                <section ref={dropzoneRef}>
                  <div>
                    <input {...getInputProps()} />
                    <h3>Drag and drop your theme's json file here, or </h3>
                    <Button type="primary">Import Json File</Button>
                    <Tooltip
                      placement="bottom"
                      title={`1) Find the JSON for your VS Code theme in its repo OR 2) Install you theme in VS Code and from the command pallette choose "Developer: Generate Color Theme From Current Settings"`}
                    >
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </div>
                </section>
              </div>
            )}
          </Dropzone>
        </>
      ) : (
        <>
          <Divider plain>Adjust Theme Settings</Divider>
          <div className="theme-details">
            <div className="name">
              Name:
              <Input
                value={newThemeDetails.name}
                onChange={e => {
                  setNewThemeDetails({
                    ...newThemeDetails,
                    name: e.target.value
                  })
                }}
              />
            </div>
            <div className="buttons">
              <Button type="primary">Import Theme</Button>
              <Button
                onClick={() => {
                  setFileDropped(false)
                  setNewThemeDetails({})
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </>
      )}
      <div className="preview">
        <Divider plain>Preview</Divider>
        <MonacoEditor
          onMount={handleEditorDidMount}
          height="25vh"
          width="100%"
          defaultLanguage="javascript"
          defaultValue={myValue}
        />
      </div>
    </Wrap>
  )
}
