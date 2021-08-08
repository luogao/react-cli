import { createContext } from 'react'
import { NotifyItem } from 'types/notify'
import { CurrentRunningTaskType } from 'types/task'

function noop () { }

interface SettingsContextProps {
  darkTheme: boolean | null;
  socketReady: boolean
  locale: string | null;
  selectedPath: string[];
  changeTheme (): void,
  changeLocale (): void,
  changeSelectedPath (path: string[]): void,
  socket: SocketIOClient.Socket
  notify: NotifyItem | null
  addNotify: (noti: NotifyItem) => void
  clearNotify (): void,
  refreshProject (): void,
  currentRunningTasks: CurrentRunningTaskType[]
  setCurrentRunningTasks (runningTasks: CurrentRunningTaskType[]): void,
}

export const SettingsContext = createContext<SettingsContextProps>({
  darkTheme: false,
  socketReady: false,
  locale: 'en',
  currentRunningTasks: [],
  selectedPath: [],
  changeTheme: noop,
  changeLocale: noop,
  changeSelectedPath: noop,
  socket: {
    on: noop,
    off: noop,
    send: noop
  } as unknown as SocketIOClient.Socket,
  notify: null,
  addNotify: noop,
  refreshProject: noop,
  clearNotify: noop,
  setCurrentRunningTasks: noop,
})
