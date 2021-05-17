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
function App(props:{socket:Socket}) {
  const {socket} =props
  //@ts-ignore
  const nowRoomData = useSelector((state: TState) => state.nowRoomData)
  console.log('app render',socket)
  console.log('nowRoomData',nowRoomData)
  if (!nowRoomData) {
    return <Lobby socket={socket}/>
  } else {
    return <Room socket={socket}/>
  }
}

export default App;
