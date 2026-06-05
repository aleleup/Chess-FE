import { WritableSignal } from "@angular/core";



export interface preBlock {
    color: string, 
    realPos: Array<number>,
    content: WritableSignal<string>,
    isSelected: WritableSignal<boolean>

}