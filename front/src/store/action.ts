import { IRoomToClient } from "../App"

export const SET_ROOMDATA = 'SET_ROOMDATA'
export const setRoomData =(roomData:IRoomToClient|undefined)=>{return{type:SET_ROOMDATA,value:roomData}} 