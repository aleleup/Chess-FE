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

export type ListenerFunction = (x: Object) => void