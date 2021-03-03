import React from 'react'
import SplitPane from 'react-split-pane'
import styled from 'styled-components'

export const DjotPanes = (props) => {
  const { offset, lines, lineComponent: Line, extra } = props
  return (
    <StyledPanes split="vertical" minSize={380} defaultSize={640}>
      {props.children}
      <StyledCompanionPane offset={offset}>
        <div className='content'>
          {!!lines?.length && lines.map((row, rowIndex) => (
            <div className='line' data-line-number={rowIndex} key={'djot-line-' + rowIndex}>
              {Line ? <Line data={row} index={rowIndex} /> : row}
            </div>
          ))}

          {extra}
        </div>

      </StyledCompanionPane>
    </StyledPanes>)
}

const StyledCompanionPane = styled.div`
  --overall-height: 120;
  --scroll-top: 0;

  position: relative;
  > .content {
    position: relative;
    height: ${({offset}) => offset.scrollHeight}px;
    top: ${({offset}) => offset.scrollTop * -1}px;

    > .line {
      /* border: 1px solid #F0F; */
      position: relative;
      line-height: 1.5em;
      x &::after {
        position: absolute;
        left: -100%;
        width: 200%;
        content: "";
        border-bottom: 1px solid #FF00FF33;
        bottom: 0;
      }

      &:hover {
        &::after {
          border-bottom-color: #00FFFF88;
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
