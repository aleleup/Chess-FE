import { EmptyExpr } from "@angular/compiler";
import { WritableSignal } from "@angular/core";

export interface Message {
    typeOfMove: string,
    currentPos: number[],
    newPos: number[],
    pawnUpgrade: string | null,
    playerId: number,
    timeStamp: number,
}
export interface BrodCastMessage {
    wasLegalMove: boolean,
    playerTurn: number,
    gameOverData: GameOverData | null,
    previousPos: number[],
    newPos: number[],
    pawnUpgrade: string,
    castelingData: CastelingData | null,
    prevTypeOfMove: string
}

export interface GameOverData {
    isTie: boolean,
    winnerId: number,
    reasson: string
}
export interface preBlock {
    color: string, 
    realPos: Array<number>,
    content: WritableSignal<string>,
    isSelected: WritableSignal<boolean>

}

export type ListenerFunction = (x: any) => void

export interface ConnectionMessage {
    success: boolean,
    id: number,
    message: string 
}

export interface CastelingData {
    kingPos: number[],
    rookPos: number[]
}
