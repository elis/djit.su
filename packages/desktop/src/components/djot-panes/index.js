import React from 'react'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'

export const DjotPanes = (props) => {
  const { lines, lineComponent: Line, linePropsHandler, extra, style = {} } = props
  return (
    <StyledPanes split="vertical" minSize={380} defaultSize={640} style={style} >
      {props.children}
      <StyledCompanionPane>
        <div className='content'>
          {!!lines?.length && lines.map((row, rowIndex) => (
            <div
              {...(typeof linePropsHandler === 'function' ? linePropsHandler(row, rowIndex) : {})}
              className='line' data-line-number={rowIndex} key={'djot-line-' + rowIndex}>
              <div className='container'>
                {Line ? <Line data={row} index={rowIndex} /> : row}
              </div>
            </div>
          ))}

          {extra}
        </div>

      </StyledCompanionPane>
    </StyledPanes>)
}

const StyledCompanionPane = styled.div`
  --overall-height: 120;

  position: relative;
  > .content {
    position: relative;
    /* height: ${({offset}) => offset?.scrollHeight ?? 0}px;
    top: ${({offset}) => offset?.scrollTop ?? 0 * -1}px; */
    height: var(--scroll-height);
    top: var(--scroll-top);
    background: var(--popover-background);

    > .line {
      /* border: 1px solid #F0F; */
      position: relative;
      line-height: 1.5em;
      max-height: 1.5em;
      /* border-bottom: 1px solid var(--primary-1); */
      z-index: 6;

      &::before {
        position: absolute;
        content: "";
        left: 16px;
        bottom: 0;
        top: -2px;
        border-left: 1px solid var(--primary-2);
        pointer-events: none;
        transition: all 240ms ease-in-out;
        z-index: 101;
      }
      > .container {
        position: relative;
        z-index: 12;
        /* background: var(--popover-background); */
        padding: 2px 12px 0 24px;
        transition: all 240ms ease-in-out;

        &::before, &::after {
          position: absolute;
          content: "";
          left: 0;
          right: 0;
          bottom: 0;
          top: calc((1.5em) * (var(--lines, 1) + 1));
          background: var(--popover-background);
          pointer-events: none;
          transition: all 240ms ease-in-out;
        }
        &::before {
          // How visible is the under-elements when not hovered
          opacity: 0.95;
          z-index: 100;
        }
        &::after {
          opacity: 0;
          z-index: -1;
        }
        > * {
          position: static;
          z-index: 20;
        }
      }

      &::after {
        position: absolute;
        left: -100vw;
        width: 300vw;
        content: "";
        border-bottom: 1px dashed var(--menu-bg);
        bottom: 0;
        z-index: 1001;
        opacity: 0.1;
        transition: all 420ms ease-out;
        pointer-events: none;
      }

      &:hover {
        z-index: auto;
        > .container {
          z-index: 1000;
          overflow: visible;
          &::before {
            opacity: 0;
          }
          &::after {
            opacity: 0.8;
          }
        }
        &::after {
          opacity: 0.17;
          border-bottom-color: var(--normal-color);
        }
      }
    }
  }
`

const StyledPanes = styled(SplitPane)`
&.SplitPane {
  overflow-y: auto;
}
.Resizer {
  background: #000;
  opacity: 0.2;
  z-index: 1;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -moz-background-clip: padding;
  -webkit-background-clip: padding;
  background-clip: padding-box;
}

.Resizer:hover {
  -webkit-transition: all 2s ease;
  transition: all 2s ease;
}

.Resizer.horizontal {
  height: 11px;
  margin: -5px 0;
  border-top: 5px solid rgba(255, 255, 255, 0);
  border-bottom: 5px solid rgba(255, 255, 255, 0);
  cursor: row-resize;
  width: 100%;
}

.Resizer.horizontal:hover {
  border-top: 5px solid rgba(0, 0, 0, 0.5);
  border-bottom: 5px solid rgba(0, 0, 0, 0.5);
}

.Resizer.vertical {
  width: 11px;
  margin: 0 -5px;
  border-left: 5px solid rgba(255, 255, 255, 0);
  border-right: 5px solid rgba(255, 255, 255, 0);
  cursor: col-resize;
}

.Resizer.vertical:hover {
  border-left: 5px solid rgba(0, 0, 0, 0.5);
  border-right: 5px solid rgba(0, 0, 0, 0.5);
}
.Resizer.disabled {
  cursor: not-allowed;
}
.Resizer.disabled:hover {
  border-color: transparent;
}
`


export default DjotPanes
