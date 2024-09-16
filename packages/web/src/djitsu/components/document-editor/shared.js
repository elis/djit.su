import styled from 'styled-components'

export const StyledEditor = styled.div`
  .ce-toolbar__actions {
    .ce-toolbar__settings-btn {
      background: var(--background-color);
      color: var(--font-body-color);
    }
  }
  .ce-block--selected {
    .ce-block__content {
      background-color: rgba(var(--primary-color-rgb), 0.3);
    }
  }
  .ce-block {
    width: 55%;
    margin: auto;
    border-bottom: 1px solid #dfdfde;
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--font-body-color);
    }
    &:first-child {
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        padding-top: 0;
      }
    }
  }
  .ce-block--focused {
  }
`
