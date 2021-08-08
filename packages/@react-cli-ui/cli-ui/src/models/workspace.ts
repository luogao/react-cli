import { createModel } from '@rematch/core'
import { ProjectType } from 'types/project'
import { RootModel } from './index'

export type WorkSpaceState = {
  currentProject: ProjectType | null
}

const defaultState: WorkSpaceState = {
  currentProject: null
}

export const workspace = createModel<RootModel>()({
  state: defaultState, // initial state
  reducers: {
    setState (state, payload: Partial<WorkSpaceState>) {
      return { ...state, ...payload }
    }
  },
  effects: (dispatch) => ({
    async checkProjectAvailable (id: string) {
      
    },
  }),
})
