
import io, { Socket } from 'socket.io-client'
//@ts-ignore
const socket = io(process.env.REACT_APP_IO_SERVER)
socket.prependAny((e, d) => console.log(e, d))
export { socket }