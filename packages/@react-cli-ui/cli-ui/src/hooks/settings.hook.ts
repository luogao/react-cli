import { useState, useCallback, useEffect, useMemo } from 'react'
import openSocket from 'socket.io-client'
import { NotifyItem } from 'types/notify'
import { CurrentRunningTaskType } from 'types/task'

import i18n from '../i18n'

const storageThemeName = 'darkTheme'
const storageLocaleName = 'locale'
const storageSelectedPathName = 'selectedPath'

const PORT = process.env.NODE_ENV === 'development' ? 8081 : 8080
const initSocket = openSocket(`http://localhost:${ PORT }`)

export function useSettings () {
  const [ darkTheme, setDarkTheme ] = useState<boolean | null>(null)
  const [ locale, setLocale ] = useState<string | null>(null)
  const [ selectedPath, setSelectedPath ] = useState<string[]>([])
  const [ notify, setNotify ] = useState<NotifyItem | null>(null)
  const [ currentRunningTasks, setCurrentRunningTasks ] = useState<CurrentRunningTaskType[]>([])
  const [ socketReady, setSocketReady ] = useState(false)
  const socket = useMemo(() => initSocket, [])

  useEffect(() => {
    socket.on('socketReady', () => {
      console.log('ready')
      setSocketReady(true)
    })
  }, [])

  useEffect(() => {
    const storedLocale = JSON.parse(localStorage.getItem(storageLocaleName)!) ?? 'en'
    const storedTheme = JSON.parse(localStorage.getItem(storageThemeName)!) ?? false
    const storedSelectedPath = JSON.parse(localStorage.getItem(storageSelectedPathName)!) ?? []
    setDarkTheme(storedTheme)
    setLocale(storedLocale)
    setSelectedPath(storedSelectedPath)
    i18n.changeLanguage(storedLocale)
  }, [])

  const changeTheme = useCallback(() => {
    localStorage.setItem(storageThemeName, JSON.stringify(!darkTheme))
    setDarkTheme(!darkTheme)
  }, [ darkTheme ])

  const changeLocale = useCallback(() => {
    const changedLocale = locale === 'en' ? 'ru' : 'en'
    localStorage.setItem(storageLocaleName, JSON.stringify(changedLocale))
    setLocale(changedLocale)
    i18n.changeLanguage(changedLocale)
  }, [ locale ])

  const changeSelectedPath = useCallback((newPath) => {
    localStorage.setItem(storageSelectedPathName, JSON.stringify(newPath))
    setSelectedPath(newPath)
  }, [ selectedPath ])


  const addNotify = useCallback((noti: NotifyItem) => {
    setNotify(noti)
  }, [ notify ])

  const clearNotify = useCallback(() => {
    setNotify(null)
  }, [])

  const refreshProject = useCallback(() => {
    socket.send({ type: 'REFRESH_PROJECT' })
  }, [])

  return {
    socket,
    locale,
    darkTheme,
    selectedPath,
    notify,
    currentRunningTasks,
    setCurrentRunningTasks,
    changeTheme,
    changeLocale,
    changeSelectedPath,
    addNotify,
    clearNotify,
    refreshProject,
    socketReady
  }
}
