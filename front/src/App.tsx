import { useMemo ,useRef} from 'react'
import { useSelector } from 'react-redux'
import io, { Socket } from 'socket.io-client'
import { Lobby } from './Lobby'
import { Room } from './Room'
import { TState } from './store/reducer'
export interface IRoomToClient {
  id: string;
  isPlaying: boolean;
  maxPlayerNum: number;  
  nowPlayerNum: number;
  players: { 
    name: string
    isReady: boolean;
  }[];
}
export function App(props:{socket:Socket}) {
  //@ts-ignore
  const socket = props.socket
  const nowRoomData = useSelector((state: TState) => state.nowRoomData)
  if (!nowRoomData) {
    return <Lobby socket={socket}/>
  } else {
    return <Room socket={socket}/>
  }
}

