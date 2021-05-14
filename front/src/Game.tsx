import { useState, useEffect } from 'react'
import { Socket } from 'socket.io-client'
import { IRoomToClient } from './App'
interface IRoom {
    maxPlayerNum: number
    nowPlayerNum: number
    isPlaying: boolean
    roomId: string
}
interface bombData {
    power:number
    x:number
    y:number
}
interface moveData{
    player:Socket
    x:number
    y:number
}
export const Game = (props:{socket: Socket, roomData: IRoomToClient}) => {
    const{socket,roomData} = props
    useEffect(() => {
        socket.on('setBomb', (bombData) => {
            
        })
        socket.on('moveUp', (moveData) => {

        })
        socket.on('moveLeft', (moveData) => {

        })
        socket.on('moveDown', (moveData) => {

        })
        socket.on('moveRight', (moveData) => {

        })
        socket.on('playerDie', () => {

        })
        initkeyBoardListener()
    }, [socket])
    const initkeyBoardListener =()=>{
    }
    const moveToUp =()=>{
        
    }
    const moveToLeft =()=>{

    }
    const moveToDown =()=>{

    }
    const moveToRight =()=>{

    }
    const setBomb =()=>{

    }
    return (
        <section>
        </section>
    )
}