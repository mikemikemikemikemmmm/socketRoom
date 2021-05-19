import { IRoomToClient } from "../App";

export const fakeData = {
    id: '456465',
    nowPlayerNum: 1,
    maxPlayerNum: 2,
    isPlaying: false,
    players: [{ name: 'setest', isReady: false }]
} as IRoomToClient