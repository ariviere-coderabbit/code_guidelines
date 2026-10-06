export interface Todo {
  id: number
  text: string
  completed: boolean
}

export interface TodoUpdate {
  text?: string
  completed?: boolean
}
