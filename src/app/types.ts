import { WritableSignal } from "@angular/core";

export interface Message {
    typeOfMove: string,
    currentPos: number[],
    newPos: number[],
    pawnUpgrade: string | null,
    playerId: number,
    timeStamp: number,
}

export interface preBlock {
    color: string, 
    realPos: Array<number>,
    content: WritableSignal<string>,
    isSelected: WritableSignal<boolean>

}