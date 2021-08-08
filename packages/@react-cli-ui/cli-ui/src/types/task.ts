export enum TaskRunningStaus {
  stop,
  running
}

export type TaskItemType = {
  name: string
  path: string
  id: string
  command: string
  projectId: string
}


export type CurrentRunningTaskType = {
  id: string
  pid: number
  projectId: string
  status: TaskRunningStaus
  taskName: string
}