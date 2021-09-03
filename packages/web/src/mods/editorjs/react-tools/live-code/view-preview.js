import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import styled from 'styled-components'
import ReactJson from 'react-json-view'

import {
  LoadingOutlined,
  CaretRightOutlined,
  FileImageOutlined,
  FileUnknownOutlined
} from '@ant-design/icons'

import Tool from 'mods/editorjs/tools/react-tool/tool.component'
import ErrorBoundary from './error-boundry'
import { exportComponent } from 'djitsu/components/utils/component-to-canvas'
import { Button, Col, Popover, Row } from 'antd'
import { VButton } from 'mods/editorjs/tools/react-tool/tool-header'

function isNode(o) {
  return typeof Node === 'object'
    ? o instanceof Node
    : o &&
        typeof o === 'object' &&
        typeof o.nodeType === 'number' &&
        typeof o.nodeName === 'string'
}

//Returns true if it is a DOM element
function isElement(o) {
  return typeof HTMLElement === 'object'
    ? o instanceof HTMLElement //DOM2
    : o &&
        typeof o === 'object' &&
        o !== null &&
        o.nodeType === 1 &&
        typeof o.nodeName === 'string'
}

export const ViewPreview = (props) => {
  const { theme, result, error, onRender, currentPreview } = props
  const previewRef = useRef()
  const outputRef = useRef()
  const snapRef = useRef()

  // ! For Dev
  const demoOutput = result // <Button type='primary'>Hello Djitsu!</Button>
  const demoError = error
  const resultGrid = true
  const isRunning = false
  const demoResultKey = Math.floor(Math.random() * 1000000).toString(32)
  const demoSize = 'auto'

  const resultOutput = useMemo(() => {
    // if (demoOutput) return <>X</>
    try {
      const rt = <>{demoOutput}</>
      return rt
    } catch (error) {
      console.log('error trying to set demoOutput', error)
    }
  }, [demoOutput])

  return (
    <Tool.View
      name='preview'
      label='Preview'
      description='Preview render...'
      icon={<CaretRightOutlined />}
      actions={
        <PreviewActions
          snapRef={snapRef}
          onRender={onRender}
          demoOutput={demoOutput}
          currentPreview={currentPreview}
        />
      }
    >
      <div className='demo divi-draw' ref={previewRef}>
        {/* {demoError && (
            <Alert
              className='demo-error'
              message='Error'
              description={demoError}
              type='error'
              showIcon
            />
          )} */}
        {demoOutput && React.isValidElement(demoOutput) && !demoError && (
          <StyledResult
            className={
              'demo-result' +
              (resultGrid ? '' : ' no-grid') +
              (isRunning || false ? ' running' : '')
            }
            theme={theme}
            ref={outputRef}
          >
            {!demoError && (
              <div className='output' ref={snapRef}>
                <BrowserRouter>
                  <ErrorBoundary key={demoResultKey}>
                    <StyledValue>{resultOutput}</StyledValue>
                  </ErrorBoundary>
                </BrowserRouter>
              </div>
            )}
            {(isRunning || false) && (
              <div
                className='indicator'
                style={{
                  height: demoSize
                }}
              >
                <LoadingOutlined size={28} />
              </div>
            )}
          </StyledResult>
        )}

        {demoOutput &&
          !React.isValidElement(demoOutput) &&
          (isNode(demoOutput) || isElement(demoOutput) ? (
            <NodeElement node={demoOutput} />
          ) : typeof demoOutput === 'string' ? (
            <StyledValue className='demo-value'>
              <em>srting</em> <code>{demoOutput}</code>
            </StyledValue>
          ) : typeof demoOutput === 'number' ? (
            <StyledValue className='demo-value'>
              <em>number</em> <code>{demoOutput}</code>
            </StyledValue>
          ) : (
            <ReactJson
              name={false}
              indentWidth={2}
              collapsed={Object.keys(demoOutput).length > 15 ? 0 : 1}
              collapseStringsAfterLength={255}
              theme={theme === 'dark' ? 'monokai' : 'rjv-default'}
              src={
                typeof demoOutput === 'object' &&
                typeof demoOutput !== 'function'
                  ? demoOutput
                  : { value: demoOutput }
              }
            />
          ))}
      </div>
    </Tool.View>
  )
}

const PreviewActions = (props) => {
  return (
    <>
      <PreviewSnapshot
        snapRef={props.snapRef}
        onRender={props.onRender}
        demoOutput={props.demoOutput}
        currentPreview={props.currentPreview}
      />
    </>
  )
}

const INITIAL_SNAPSHOT_DELAY = 1000 * 30 // 30 seconds
const ADDITIONAL_SNAPSHOT_DELAY = 1000 * 15 // 15 seconds

const PreviewSnapshot = (props) => {
  const { snapRef, onRender, demoOutput, currentPreview } = props
  const [snapshot, setSnapshot] = useState([currentPreview])
  const [isNovel, setIsNovel] = useState()

  const takeSnapshot = useCallback(async () => {
    if (!snapRef.current) return

    const backgroundColor =
      window
        .getComputedStyle(document.getElementById('root'))
        .getPropertyValue('--background-color') || null

    const result = await exportComponent(snapRef.current, {
      backgroundColor,
      logging: false,
      onclone: async () => {
        // Small delay to allow all styles to settle
        await new Promise((r) => setTimeout(r, 300))
      }
    })
    setIsNovel(false)
    setSnapshot(result)
    if (!currentPreview) onRender?.(result)
    if (result?.[0] && currentPreview !== result[0]) setIsNovel(true)
  }, [currentPreview])

  const keepSnapshot = () => {
    onRender?.(snapshot)
  }

  useEffect(() => {
    if (demoOutput) {
      const delay =
        !snapshot || currentPreview === snapshot
          ? INITIAL_SNAPSHOT_DELAY
          : ADDITIONAL_SNAPSHOT_DELAY

      const tid = setTimeout(() => takeSnapshot(), delay)
      return () => clearTimeout(tid)
    }
  }, [demoOutput])

  return (
    <Popover
      title='Visual Snapshot'
      content={
        <>
          <h2>Current</h2>
          <img
            src={currentPreview}
            style={{ width: '320px', height: 'auto' }}
          />

          <h2>Most Recent</h2>
          <img src={snapshot?.[0]} style={{ width: '320px', height: 'auto' }} />
          <Row>
            <Col flex>
              <Button size='small' onClick={takeSnapshot} type='ghost'>
                Retake Snapshot
              </Button>
            </Col>
            <Col flex='auto' />
            <Col flex>
              <Button
                size='small'
                onClick={keepSnapshot}
                disabled={!isNovel}
                type={isNovel ? 'primary' : ''}
              >
                Keep Snapshot
              </Button>
            </Col>
          </Row>
        </>
      }
    >
      <VButton onClick={() => takeSnapshot()} size='small'>
        {snapshot?.[0] ? <FileImageOutlined /> : <FileUnknownOutlined />}
      </VButton>
    </Popover>
  )
}

const StyledValue = styled.div`
  color: var(--font-body-color);
  > em:first-child {
    margin-right: 1em;
  }
`
const StyledResult = styled.div`
  &.demo-result {
    background-color: var(--tool-background-color);
    border: 12px solid #f0f;
    padding: 6px;
    position: relative;
    &:not(.no-grid) {
      background-image: ${({ theme }) =>
        theme === 'dark'
          ? graphPaper('%23303030', '0.95')
          : graphPaper('%23f0f0f0', '0.95')};
    }

    border: 1px solid var(--separator-color);
    border-left: none;
    border-right: none;

    .output,
    .indicator {
      transition: all 220ms ease-out;
    }
    &.running {
      .output {
        opacity: 0.4;
        pointer-events: none;
      }
      .indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
      }
    }
  }
`

export const NodeElement = (props) => {
  const { node } = props
  const self = useRef()

  useEffect(() => {
    if (self.current && self.current.removeChild) {
      while (self.current.lastChild) {
        self.current.removeChild(self.current.lastChild)
      }
      self.current.appendChild(node)
    }
  }, [node])

  return <div ref={self} style={{ color: 'var(--font-body-color)' }} />
}

const graphPaper = (foreground, foregroundOpacity = 0.24) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${foreground}' fill-opacity='${foregroundOpacity}'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`

export default ViewPreview
