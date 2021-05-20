
import { Lobby } from '../Lobby'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { socket } from '../socket'
import { fakeData } from './fakeRoom'
import { createServer, } from 'http'
import * as IO from 'socket.io'
import Client, { Socket } from 'socket.io-client'
import { App, IRoomToClient } from '../App'
import { Provider } from 'react-redux'
import { reducer, ininatailState, store } from '../store/reducer'
import { createStore } from 'redux'

describe('components', () => {
    it('should render without crash', () => {
        const { getByTestId } = render(
        <Provider store={store}>
            <Lobby socket={socket} />
        </Provider>
        )
        const LobbyComponent = getByTestId('Lobby')
        expect(LobbyComponent).toBeVisible()
    })
})
describe('without serverSocket', () => {
    jest.mock('socket.io-client');
    it('change userName', () => {
        const { getByTestId } = render(
        <Provider store={store}>
            <Lobby socket={socket} />
        </Provider>)
        const name = getByTestId('nameInput')
        const userName = 'mike2'
        act(() => {
            fireEvent.change(name, { target: { value: userName } })
        })
        expect(name).toHaveValue(userName)
    })
    it('change roomName', () => {
        const { getByTestId } = render(
            <Provider store={store}>
                <Lobby socket={socket} />
            </Provider>)
        const name = getByTestId('createInout')
        const userName = 'mike3'
        act(() => {
            fireEvent.change(name, { target: { value: userName } })
        })
        expect(name).toHaveValue(userName)
    })
})
describe('event with serverSocket', () => {
    let serverSocket: IO.Socket
    let clientSocket: Socket
    let getAllByTestId: (s: string) => HTMLElement[]
    let getByTestId: (s: string) => HTMLElement
    let ioServer: IO.Server
    let port: string
    beforeEach((done) => {
        const httpServer = createServer()
        ioServer = new IO.Server(httpServer);
        httpServer.listen()
        port = httpServer.address().port;
        clientSocket = new Client(`http://localhost:${port}`);
        ioServer.on('connection', socket => {
            serverSocket = socket
            clientSocket.on("connect", () => {
                const resetStore = createStore(reducer)
                const container = render(
                    <Provider store={resetStore}>
                        <App socket={clientSocket} />
                    </Provider>)
                getAllByTestId = container.getAllByTestId
                getByTestId = container.getByTestId
                done()
            });
        })
    })
    afterEach(() => {
        ioServer.close();
        clientSocket.close();

    })
    it('when server emit refreshRooms,roomDataList should refresh', async () => {
        act(() => {
            serverSocket.emit('refreshRooms', [fakeData])
        })
        await waitFor(() => {
            const roomData = getAllByTestId('roomData')
            const roomDataId = getAllByTestId('roomDataId')
            expect(roomData).toHaveLength(1)
            expect(roomDataId[0]).toHaveTextContent(fakeData.id)
        })
    })
    it('when getUserName, change input', async () => {
        const userName = 'mike'
        act(() => {
            serverSocket.emit('getUserName', userName)
        })
        await waitFor(() => {
            const name = getByTestId('nameInput')
            expect(name).toHaveValue(userName)
        })
    })
    it('create room and join', async () => {
        const userNameInput = getByTestId('nameInput')
        const roomNameInput = getByTestId('createInout')
        const createBtn = getByTestId('createBtn')
        const fakeUserName = 'mike'
        const fakeRoomName = 'room'
        const fakeRoomData = {
            id: fakeRoomName,
            nowPlayerNum: 1,
            maxPlayerNum: 2,
            isPlaying: false,
            players: []
        }
        act(() => {
            fireEvent.change(userNameInput, { target: { value: fakeUserName } })
            fireEvent.change(roomNameInput, { target: { value: fakeRoomName } })
            fireEvent.click(createBtn)
            serverSocket.emit('refreshRooms', [fakeRoomData])
            serverSocket.emit('createRoomSuccess', fakeRoomData.id)
        })
        await waitFor(() => {
            const roomData = getAllByTestId('roomData')
            const roomDataId = getAllByTestId('roomDataId')
            expect(roomData).toHaveLength(1)
            expect(roomDataId[0]).toHaveTextContent(fakeRoomName)
        })
        act(() => {
            serverSocket.emit('joinRoomSuccess', { ...fakeRoomData, players: [{ name: fakeUserName, isReady: false }] })
        })
        await waitFor(() => {
            const roomComponent = getByTestId('Room')
            expect(roomComponent).toBeInTheDocument()
            const playerName = getAllByTestId('playerName')
            expect(playerName[0]).toHaveTextContent(fakeUserName)
        })
    })
    it('click to join room', async () => {
        const userNameInput = getByTestId('nameInput')
        const fakeRoomName = '123456'
        const fakeUserName = 'mikememm'
        const fakeCreaterName = 'mikememm22222'
        const fakeRoomData: IRoomToClient = {
            id: fakeRoomName,
            maxPlayerNum: 2,
            nowPlayerNum: 1,
            isPlaying: false,
            players: [{
                name: fakeCreaterName,
                isReady: false
            }]
        }
        act(() => {
            fireEvent.change(userNameInput, { target: { value: fakeUserName } })
            serverSocket.emit('refreshRooms', [fakeRoomData])
        })
        await waitFor(() => {
            const roomLiId = getAllByTestId('roomDataId')
            expect(roomLiId[0]).toHaveTextContent(fakeRoomName)
        })
        const joinBtn = getAllByTestId('joinBtn')
        act(() => {
            fireEvent.click(joinBtn[0])
            serverSocket.emit('joinRoomSuccess', { ...fakeRoomData, players: [...fakeRoomData.players, { name: fakeUserName, isReady: false }] })
        })
        await waitFor(() => {
            const roomComponent = getByTestId('Room')
            expect(roomComponent).toBeInTheDocument()
            const playerName = getAllByTestId('playerName')
            expect(playerName[0]).toHaveTextContent(fakeCreaterName)
            expect(playerName[1]).toHaveTextContent(fakeUserName)
        })

    })
})