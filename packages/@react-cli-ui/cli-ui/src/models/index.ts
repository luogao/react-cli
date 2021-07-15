import { Models } from '@rematch/core'
import { workspace } from './workspace'

export interface RootModel extends Models<RootModel> {
  workspace: typeof workspace
}

export const models: RootModel = {
  workspace
}
