import { TaskItemType } from "./task";

export type ProjectType = {
  id: string
  path: string[]
  favorite: boolean
  type: string
  name: string
  openDate: number
  tasks: TaskItemType[]
  isAvailable: boolean
}
