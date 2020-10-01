import React, { useState, useEffect, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { Routes } from 'router'
import { SettingsContext } from '../../context'

import useTaskContainer, { TabItem } from './taskContainer.hook'
import { DashboardWrap } from '@components'

import ProjectIcon from '@icons/nav-projects.svg'

import css from './style.module.scss'

export default function TaskContainer () {
  const { t } = useTranslation('dashboard')
  const { locale, activeTab } = useTaskContainer()
  const { socket } = useContext(SettingsContext)
  const [tasks, setTask] = useState<any[]>([])

  function getKey (key: string) {
    if (key === 'start') {
      return Routes.DASHBOARD_TASKS_START
    } else if (key === 'build') {
      return Routes.DASHBOARD_TASKS_BUILD
    } else if (key === 'test') {
      return Routes.DASHBOARD_TASKS_TEST
    } else if (key === 'eject') {
      return Routes.DASHBOARD_TASKS_EJECT
    } else {
      return Routes.DASHBOARD_TASKS
    }
  }

  useEffect(() => {
    socket.send({
      type: 'GET_LIST_TASKS'
    })

    socket.on('tasks', (res: any) => {
      const data = Object.entries(res.data)
      const list = []
      for (const [key, value] of data) {
        list.push({ name: key, label: value, key: getKey(key), Icon: ProjectIcon })
      }
      setTask(list)
    })

    return () => {
      socket.off('tasks')
    }
  }, [])

  const renderChildren = useMemo(() => tasks.map(({ key, label, name }: TabItem) => {
    return (
      <NavLink
        key={key}
        exact={true}
        to={key}
        activeClassName={css.active}
        isActive={(_, location) => {
          if (key === location.pathname) {
            return true
          }
          return false
        }}
      >
        <div className={css.taskElement}>
          <span className={css.name}>{name}</span>
          <span className={css.value}> {label}</span>
        </div>
      </NavLink>
    )
  }), [activeTab, locale, tasks])

  function renderTask () {
    return (
      <div className={css.wrapper}>
        {renderChildren}
      </div>
    )
  }

  return (
    <DashboardWrap title={t('titleTasks')} cssStyle={{ width: '300px' }}>
      {renderTask()}
    </DashboardWrap>
  )
}
