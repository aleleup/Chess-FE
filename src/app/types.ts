import { WritableSignal } from "@angular/core";

export interface blockData {
    realPos: Array<number>, content: WritableSignal<string>
}