import React, { useMemo } from 'react'
import styled from 'styled-components'
import { List, Progress } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  LoadingOutlined,
  FieldTimeOutlined,
  ExceptionOutlined
} from '@ant-design/icons'
import meld from 'djitsu/utils/meld'

export const AuthStatus = (props) => {
  const { tasks, status, progress, descriptions } = props

  const progressTasks = useMemo(
    () =>
      meld({
        title: tasks,
        status,
        progress,
        description: descriptions
      }),
    [tasks, status, progress, descriptions]
  )

  const totalTasks = useMemo(() => progressTasks.length, [progressTasks])
  const startedTasks = useMemo(
    () =>
      progressTasks.filter(
        ({ status }) =>
          status !== AuthStatus.COMPLETE && status !== AuthStatus.ERROR
      ).length,
    [progressTasks]
  )
  const completedTasks = useMemo(
    () =>
      progressTasks.filter(
        ({ status, progress }) =>
          status === AuthStatus.COMPLETE ||
          status === AuthStatus.ERROR ||
          (status === AuthStatus.PROGRESS && progress === 100)
      ).length,
    [progressTasks]
  )
  const inProgressTasks = useMemo(
    () =>
      progressTasks
        .filter(({ status }) => status === AuthStatus.PROGRESS)
        .reduce((total, { progress }) => progress, 0) / totalTasks,
    [progressTasks]
  )

  const totalStarted = Math.floor((startedTasks / totalTasks) * 100)
  const totalSuccess = Math.floor(
    inProgressTasks + (completedTasks / totalTasks) * 100
  )

  return props.progressBar || props.circle ? (
    <Progress
      percent={totalStarted}
      success={{
        percent: totalSuccess,
        ...(!props.circle ? { strokeColor: 'var(--normal-color)' } : {})
      }}
      type={props.circle ? 'circle' : 'line'}
      strokeLinecap='square'
      showInfo={props.showInfo}
      status={completedTasks < totalTasks ? 'active' : null}
    />
  ) : (
    <List
      key='progress-list'
      size='small'
      itemLayout='horizontal'
      dataSource={progressTasks}
      renderItem={(item) => (
        <StyledStatusItem
          className={`status-item ${item.status || AuthStatus.PENDING}`}
        >
          <div className='status'>
            {item.status === AuthStatus.COMPLETE ||
            (item.status === AuthStatus.PROGRESS && item.progress >= 100) ? (
              <CheckOutlined style={{ color: 'var(--success-color)' }} />
            ) : item.status === AuthStatus.ERROR ? (
              <CloseOutlined style={{ color: 'var(--error-color)' }} />
            ) : item.status === AuthStatus.CANCELED ? (
              <ExceptionOutlined style={{ color: 'var(--warning-color)' }} />
            ) : item.status === AuthStatus.STARTED ||
              (item.status === AuthStatus.PROGRESS && item.progress < 1) ? (
              <LoadingOutlined />
            ) : item.status === AuthStatus.PROGRESS ? (
              <Progress
                type='circle'
                percent={item.progress}
                width={16}
                strokeWidth={12}
                showInfo={false}
              />
            ) : (
              // * item.status === AuthStatus.PENDING || !item.status ?
              <FieldTimeOutlined />
            )}
          </div>
          <div className='title'>{item.title}</div>
          {item.description && (
            <div className='description'>{item.description}</div>
          )}
        </StyledStatusItem>
      )}
    />
  )
}

const StyledStatusItem = styled(List.Item)`
  &.ant-list-item {
    display: grid;
    grid-template-areas:
      'icon title'
      'icon description';
    grid-template-columns: 40px 1fr;
    transition: opacity 120ms ease-in-out;

    .status {
      width: 30px;
      text-align: center;
      grid-area: icon;
      align-self: flex-start;
    }
    .title {
      grid-area: title;
      text-align: left;
    }
    .description {
      text-align: left;
      grid-area: description;
    }

    &.pending {
      opacity: 0.25;
    }
    &.canceled {
      opacity: 0.45;
      .title,
      .description {
        text-decoration: line-through;
      }
    }
  }
`
AuthStatus.PENDING = 'pending'
AuthStatus.STARTED = 'started'
AuthStatus.COMPLETE = 'complete'
AuthStatus.PROGRESS = 'progress'
AuthStatus.ERROR = 'error'
AuthStatus.CANCELED = 'canceled'

export default AuthStatus
