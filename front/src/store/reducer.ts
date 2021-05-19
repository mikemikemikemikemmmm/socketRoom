import { createStore } from 'redux'
import { IRoomToClient } from '../App'
interface IAction {
  type: string,
  value: unknown
}
const ininatailState = {
  nowRoomData: undefined as IRoomToClient | undefined,
}
export function reducer(state = ininatailState, action: IAction) {
  switch (action.type) {
    case "SET_ROOMDATA":
      return { ...state, nowRoomData: action.value as IRoomToClient }
    default:
      return state
  }
}
export type TState = typeof ininatailState
export const store = createStore(reducer)