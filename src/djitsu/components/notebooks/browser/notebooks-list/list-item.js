import React from 'react'
import {
  ForkOutlined,
  HeartFilled,
  SolutionOutlined,
  StarFilled
} from '@ant-design/icons'
import { Col, Divider, List, Row, Space, Statistic } from 'antd'
import { Link } from 'djitsu/adapters/routes'
import moment from 'moment'
import styled from 'styled-components'

export const listItem = (props) => (item) => (
  <StyledListItem onClick={(event) => props.handleItemClick?.(item, event)}>
    <List.Item.Meta
      avatar={
        item.properties.previewPhotoUrl ? (
          <img src={item.properties.previewPhotoUrl} />
        ) : (
          <SolutionOutlined />
        )
      }
      title={
        <Row justify='space-between'>
          <Col>
            <h3>
              <Link to={`/d${item.notebookId}`}>
                {item.properties?.title ||
                  item.properties?.name ||
                  item.notebookId}
              </Link>
            </h3>
          </Col>
          <Col>
            {item.meta.isPublished && (
              <div>
                <Link to={`/@${item.meta.createdBy}/${item.properties.name}`}>
                  v{item.meta.version}
                </Link>
              </div>
            )}
          </Col>
        </Row>
      }
      description={
        <>
          <Row justify='space-between'>
            <Col>
              <Space className='data'>
                <Statistic
                  title='Last Saved'
                  value={moment(item.meta.updated).fromNow()}
                />
                {item.meta.isPublished && (
                  <Statistic
                    title='Last Published'
                    value={moment(item.meta.published).fromNow()}
                  />
                )}
              </Space>
              {item.description}
              {item.description && <Divider style={{ margin: '6px 0' }} />}
            </Col>
            <Col>
              {item.stats && (
                <Space>
                  {Object.entries(item.stats)
                    .filter(
                      ([key]) => ['like', 'star', 'fork'].indexOf(key) >= 0
                    )
                    .filter(([, count]) => count)
                    .sort(
                      ([a], [b]) =>
                        ['like', 'star', 'fork'].indexOf(a) -
                        ['like', 'star', 'fork'].indexOf(b)
                    )
                    .map(([aff, count], index) => (
                      <span key={`aff-${index}-${aff}`}>
                        {aff === 'star' ? (
                          <StarFilled
                            style={{
                              color: 'var(--warning-color)'
                            }}
                          />
                        ) : aff === 'like' ? (
                          <HeartFilled
                            style={{
                              color: 'var(--error-color)'
                            }}
                          />
                        ) : (
                          <ForkOutlined
                            style={{
                              color: 'var(--color-primary)'
                            }}
                          />
                        )}{' '}
                        {count}
                      </span>
                    ))}
                </Space>
              )}
            </Col>
          </Row>
        </>
      }
    />
  </StyledListItem>
)

const StyledListItem = styled(List.Item)`
  --cover-width: 180px;
  @media screen and (max-width: 570px) {
    --cover-width: 114px;
  }

  &.ant-list-item {
    .ant-list-item-meta-title {
      margin-bottom: 0;
      line-height: 1.25em;
    }
    .ant-list-item-meta-avatar {
      width: var(--cover-width);
      height: calc(var(--cover-width) * 0.57);
      overflow: hidden;
      border-radius: 3px;
      background: var(--object-background-color);
      display: flex;
      padding: 3px;
      box-shadow: var(--shadow-e1);
      transition: all 120ms ease-in-out;
      &:hover {
        box-shadow: var(--shadow-e1);
      }
      img {
        object-fit: cover;
        height: 100%;
        width: 100%;
        object-position: top left;
      }
      .anticon {
        font-size: 44px;
        color: var(--primary-color);
        align-self: center;
        width: 100%;
        @media screen and (max-width: 570px) {
          font-size: 24px;
        }
      }
    }

    .data {
      .ant-statistic {
        &-title {
          font-size: 10px;
        }
        &-content {
          font-size: 12px;
          &-suffix {
            font-size: 11px;
            margin-left: 0.25em;
          }
        }
      }
      .ant-divider.ant-divider-vertical {
        margin: 0;
      }
      .ant-divider.ant-divider-horizontal {
        margin: 10px 0;
      }
    }
  }
`

export default listItem
