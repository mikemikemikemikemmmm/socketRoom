import express, { Request, Response } from "express"
import { BroadcastOperator, Server, Socket } from "socket.io";
import http from 'http'
const app = express()
const port = 3001
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
app.get('/', (req, res) => {
  res.send('test');
});
class RoomManager {
  id: string
  isPlaying: boolean
  maxPlayerNum: number
  players: SocketManager[]
  ioManager: IoManager
  gameManager?: GameManager
  constructor(id: string, isPlaying: boolean, maxPlayerNum: number, ioManager: IoManager) {
    this.id = id
    this.isPlaying = isPlaying
    this.maxPlayerNum = maxPlayerNum
    this.players = []
    this.ioManager = ioManager
  }
  getRoomDataToClient() {
    return {
      id: this.id,
      isPlaying: this.isPlaying,
      maxPlayerNum: this.maxPlayerNum,
      nowPlayerNum: this.players.length,
      players: this.players.map(player => {
        return {
          name: player.name,
          isReady: player.playerStatus === 'ready'
        }
      })
    }
  }
  handleStartGame() {
    const isAllReady = this.players.every(player => player.playerStatus === 'ready')
    if (!isAllReady) {
      return
    }
    this.isPlaying = true
    this.players.forEach(p => p.gameStart())
    this.gameManager = new GameManager(this)
    this.ioManager.io.to(this.id).emit('getRoomData', this.getRoomDataToClient())
  }
  endGame() {
    this.isPlaying = false
    this.players.forEach(player => player.playerStatus = 'notReady')
    this.gameManager = undefined
  }
  handlePlayerJoin(socketManager: SocketManager) {
    if (this.maxPlayerNum === this.players.length) {
      return 'fail'
    }
    this.players.push(socketManager)
    const roomDataToClient = this.getRoomDataToClient()
    this.refreshRoomData()
    this.ioManager.boardcastRefreshRoomsData()
  }
  handlePlayerLeave(socketManager: SocketManager) {
    const targetSocketIndex = this.players.findIndex(player => player.socket.id === socketManager.socket.id)
    this.players.splice(targetSocketIndex, 1)
    this.refreshRoomData()
    this.ioManager.boardcastRefreshRoomsData()
  }
  handleCreaterLeave() {
    this.gameManager = undefined
    this.players.forEach(p => p.leaveRoom())
    this.players = []
    this.ioManager.deleteRoom(this.id)
    this.refreshRoomData(true)
  }
  refreshRoomData(isDeleteRoom = false) {
    if (isDeleteRoom) {
      this.ioManager.io.to(this.id).emit('getRoomData', undefined)
      return
    }
    this.ioManager.io.to(this.id).emit('getRoomData', this.getRoomDataToClient())
  }
}
class GameManager {
  room: RoomManager
  BOMB_TIME: number
  playSockets: Socket[]

  constructor(room: RoomManager) {
    this.room = room
    this.BOMB_TIME = 2000
    this.playSockets = this.room.players.map(player => player.socket)
  }
  init() {
    this.createMap()
    this.initListener()
  }
  boardcastEmit(eventName: string, data: unknown) {
    this.room.ioManager.io.to(this.room.id).emit(eventName, data)
  }
  removeListener() {
    this.room.players.forEach(player => {
      const { socket } = player
      socket.removeAllListeners('setBomb')
      socket.removeAllListeners('moveUp')
      socket.removeAllListeners('moveLeft')
      socket.removeAllListeners('moveDown')
      socket.removeAllListeners('moveRight')
      socket.removeAllListeners('playerDie')
    })
  }
  initListener() {
    this.playSockets.forEach(socket => {
      socket.on('setBomb', (bombData: { x: number, y: number, power: number }) => {
        this.boardcastEmit('setBomb', bombData)
        setTimeout(() => {
          this.boardcastEmit('bombFire', bombData)
        }, this.BOMB_TIME)
      })
      socket.on('moveUp', (moveData) => {
        this.boardcastEmit('moveUp', moveData)
      })
      socket.on('moveLeft', (moveData) => {
        this.boardcastEmit('setBomb', moveData)
      })
      socket.on('moveDownToServer', (moveData) => {
        this.boardcastEmit('setBomb', moveData)
      })
      socket.on('moveLeftToServer', (moveData) => {
        this.boardcastEmit('setBomb', moveData)
      })
      socket.on('playerDie', (moveData) => {
        this.boardcastEmit('setBomb', moveData)
      })
    })
  }
  createMap() {
  }
  isTouchBomb() {

  }
  playerMove(socket: Socket, direction: '' | '' | '' | '') {

  }
  isSomeoneDie() {

  }
  gameOver() {
    this.room.players.forEach(player => player.socket.emit('gameOver'))
    this.room.gameManager = undefined
  }
}
class SocketManager {
  socket: Socket
  status: "lobby" | 'room' | 'roomCreater'
  playerStatus: "notReady" | 'ready' | 'playing' | 'notInRoom'
  io: IoManager
  room?: RoomManager
  name: string
  constructor(socket: Socket, io: IoManager) {
    this.socket = socket
    this.status = 'lobby'
    this.io = io
    this.room = undefined
    this.playerStatus = 'notInRoom'
    this.name = ''
    this.socket.prependAny((event) => console.log(event))
    this.initListenerInLobby()
    this.initListenerForException()
  }
  initListenerForException() {
    this.socket.once("error", (err) => this.socket.disconnect());
    this.socket.on('disconnect', () => this.handleDisconnect())
  }
  setSocketName(name: string) {
    this.name = name
  }
  initListenerInLobby() {
    this.socket.emit("refreshRooms", this.io.getAllRoomsData())
    this.socket.on("setUserName", name=>this.setSocketName(name))
    this.socket.on("joinRoom", roomId => this.joinRoom(roomId))
    this.socket.on("createRoom", (roomId) => this.createRoom(roomId))
  }
  removeListenerInLobby() {
    this.socket.removeAllListeners("joinRoom")
    this.socket.removeAllListeners("setUserName")
    this.socket.removeAllListeners("createRoom")
  }
  initLisenerInRoom() {
    this.socket.on('playerReady', () => this.readyForGame())
    this.socket.on('playerLeave', () => {
      if (this.status === 'room') {
        this.leaveRoom()
      } else if (this.status === 'roomCreater') {
        this.createrLeaveRoom()
      }
    })
  }
  removeListenerInRoom() {
    this.socket.removeAllListeners("playerReady")
    this.socket.removeAllListeners("playerLeave")
  }
  handleDisconnect() {
    console.log(`${this.socket.id} disconnect`)
    switch (this.status) {
      case 'room':
        this.leaveRoom()
        break;

      case 'roomCreater':
        this.createrLeaveRoom()
        break;
      default:
        break;
    }
    this.socket.removeAllListeners()
  }
  gameStart() {
    this.playerStatus = 'playing'
  }
  joinRoom(roomId: string, isCreater: boolean = false) {
    if(!this.testName()){
      return
    }
    if (!this.io.isRoomExist(roomId)) {
      this.socket.emit('joinRoomFail')
      return
    }
    const targetRoom = this.io.roomsMap[roomId]
    const result = targetRoom.handlePlayerJoin(this)
    if (result === 'fail') {
      this.socket.emit('joinRoomFail')
      return
    }
    if (isCreater) {
      this.status = 'roomCreater'
    } else {
      this.status = 'room'
    }
    this.playerStatus = 'notReady'
    this.room = targetRoom
    this.socket.join(roomId)
    this.socket.emit('joinRoomSuccess', this.getRoomDataToClient())
    this.initLisenerInRoom()
    this.removeListenerInLobby()
  }
  leaveRoom() {
    this.room?.handlePlayerLeave(this)
    this.socket.leave(this.room?.id as string)
    this.room = undefined
    this.status = 'lobby'
    this.playerStatus = 'notInRoom'
    this.removeListenerInRoom()
    this.initListenerInLobby()
  }
  readyForGame() {
    this.playerStatus = 'ready'
    this.socket.emit("getRoomData", this.getRoomDataToClient())
  }
  getRoomDataToClient() {
    return this.room?.getRoomDataToClient()
  }
  createrLeaveRoom() {
    this.room?.handleCreaterLeave()
  }
  createRoom(roomId: string) {
    if(!this.testName()){
      return
    }
    const result = this.io.createRoom(roomId)
    if (result === 'fail') {
      this.socket.emit('createRoomFail')
      return
    }
    this.socket.emit('createRoomSuccess', roomId)
    this.joinRoom(roomId, true)
  }
  testName(){
    if(this.name === ''){
      this.socket.emit('nameIllegal')
      return false
    }
    return true
  }
}
class IoManager {
  io: typeof io
  roomsMap: { [roomId: string]: RoomManager }
  constructor(ioInstance: typeof io) {
    this.io = ioInstance
    this.roomsMap = {}//key is id
    this.initListener()
  }
  initListener() {
    io.on('connection', (socket) => {
      console.log('a user connected', socket.id);
      const newSocket = new SocketManager(socket, this)
    });
  }
  getAllRoomsData() {
    const rooms = Object.values(this.roomsMap)
    return rooms.map(room => room.getRoomDataToClient())
  }
  isRoomExist(roomId: string) {
    return roomId in this.roomsMap
  }
  createRoom(roomId: string) {
    if (this.isRoomExist(roomId)) {
      return 'fail'
    }
    const newRoom = new RoomManager(roomId, false, 2, this)
    this.roomsMap[roomId] = newRoom
    this.boardcastRefreshRoomsData()
  }
  deleteRoom(roomId: string) {
    delete this.roomsMap[roomId]
    this.boardcastRefreshRoomsData()
  }
  boardcastRefreshRoomsData() {
    this.io.emit("refreshRooms", this.getAllRoomsData())
  }
}
const ioManager = new IoManager(io)
server.listen(port, () => {
  console.log('listening on *:3001');
});