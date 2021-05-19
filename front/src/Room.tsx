import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Socket } from 'socket.io-client'
import { Game } from './Game'
import { setRoomData } from './store/action'
import { TState } from './store/reducer'

export const Room = (props: { socket: Socket }) => {
    const { socket } = props
    const dispatch = useDispatch()
    const roomData = useSelector((state: TState) => state.nowRoomData)
    useEffect(() => {
        socket.on('getRoomData', (roomData) => roomData ? dispatch(setRoomData(roomData)) : handleLeaveRoom())
        return () => {
            socket.off('getRoomData')
        }
    }, [socket])
    const handleReady = () => {
        socket.emit('playerReady')
    }
    const handleGameStart = () => {
        if (roomData?.players.some(player => !player.isReady)) {
            return
        }
        socket.emit('gameStart')
    }
    const handleLeaveRoom = () => {
        socket.emit("playerLeave")
        dispatch(setRoomData(undefined))
    }
    return (
        <section data-testid='Room'>
            <button onClick={() => handleLeaveRoom()}>leave room</button>
            <div className="">roomId:{roomData?.id}</div>
            <div className="">now player num : {`${roomData?.nowPlayerNum}/${roomData?.maxPlayerNum}`}</div>
            {roomData?.players.map(player => <div data-testid="playerName" key={player.name}>{player.name} isReady:{player.isReady ? "ready" : "not ready"}</div>)}
            {roomData?.isPlaying && <Game socket={socket} roomData={roomData} />}
        </section>
    )
}