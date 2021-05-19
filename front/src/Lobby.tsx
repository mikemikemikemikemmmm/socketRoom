import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Socket } from 'socket.io-client'
import { IRoomToClient } from './App'
import { setRoomData } from './store/action'
interface IProps {
    socket: Socket
}
export const Lobby = (props: IProps) => {
    const dispatch = useDispatch()
    const { socket } = props
    const [roomsData, setRoomsData] = useState<IRoomToClient[]>([])
    const [createRoomName, setCreateRoomName] = useState('')
    const [userName, setUserName] = useState('')
    useEffect(() => {
        socket.on('refreshRooms', (roomsData) => {
            setRoomsData(roomsData)
        })
        socket.on('getUserName', (name) => {
            setUserName(name)
        })
        socket.on('nameIllegal', () => {
            alert('name illegal')
        })
        return () => {
            socket.off('refreshRooms')
            socket.off('getUserName')
            socket.off('nameIllegal')
        }
    }, [socket])
    const handleClickRoom = (roomId: string, isCreater = false) => {
        if (!isCreater) {
            emitSetUserName()
            socket.emit('joinRoom', roomId)
        }
        socket.once('joinRoomSuccess', (roomData: IRoomToClient) => {
            dispatch(setRoomData(roomData))
            socket.off('joinRoomFail')
        })
        socket.once('joinRoomFail', () => {
            socket.off('joinRoomSuccess')
        })
    }
    const handleCreateRoom = () => {
        emitSetUserName()
        socket.emit('createRoom', createRoomName)
        socket.once('createRoomSuccess', (roomId: string) => {
            handleClickRoom(roomId, true)
            socket.off('createRoomFail')
        })
        socket.once('createRoomFail', () => {
            socket.off('createRoomSuccess')
        })

    }
    const handleCreateRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === '') {
            return
        }
        setCreateRoomName(e.target.value)
    }
    const emitSetUserName = () => {
        socket.emit('setUserName', userName)
    }
    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value)
    }
    return (
        <section data-testid='Lobby'>
            <div>
                <input data-testid='createInout' type="text" name="" id="" onChange={(e) => handleCreateRoomName(e)} />
                <button data-testid='createBtn' onClick={() => handleCreateRoom()}>create room</button>
            </div>
            now rooms
            <div className="">
                <input type="text" name="" id="" value={userName} data-testid='nameInput' onChange={(e) => handleChangeName(e)} placeholder="user name" />
            </div>
            <ul>
                {roomsData.map(roomData => {
                    return <li key={roomData.id} data-testid='roomData'>
                        <span className="" data-testid='roomDataId'>{roomData.id}</span>
                        <button data-testid='joinBtn' style={{ display: 'inline-block' }} onClick={() => handleClickRoom(roomData.id)}>join room</button>
                    </li>
                })}
            </ul>
        </section>
    )
}