import { createModel } from '@rematch/core'
import { TaskItemType } from 'types/task'
import { RootModel } from './index'

export type ProjectTaskListState = {
  list: TaskItemType[]
}

const defaultState: ProjectTaskListState = {
  list: []
}

export const projectTaskList = createModel<RootModel>()({
  state: defaultState, // initial state
  reducers: {
    setState (state, payload: Partial<ProjectTaskListState>) {
      return { ...state, ...payload }
    }
  }
  // effects: (dispatch) => ({
  //   async setCurrentProject (id: string) {

  //   },
  // }),
})
