import { Component, input, signal, output, WritableSignal } from "@angular/core";
import { Piece } from "../piece/piece.component";

@Component({
    selector: 'block',
    templateUrl: './block.component.html',
    styleUrl: './block.component.css',
    imports: [Piece]
})
export class Block {
    realPos = input<number[]>([]);
    content = input<WritableSignal<string>>(signal<string>(""))
    blockColor = input<string>("");
    isSelected = input<WritableSignal<boolean>>(signal<boolean>(false));
    positionSetter = output<number[]>()
    // x = {
    //     wP: PawnComponent
    // }
    showPosOnClick() {
        console.log(this.realPos())
        this.positionSetter.emit(this.realPos());
    };

};