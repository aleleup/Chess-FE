import { WritableSignal } from "@angular/core";

export interface blockData {
    realPos: Array<number>, content: WritableSignal<string>
}

export interface preBlock {color: string, realPos: Array<number>}