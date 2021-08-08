export enum NotifyItemType {
  info,
  warn,
  success,
  error,
}

export type NotifyItem = {
  message: string
  type: NotifyItemType
}