import { Component, input, signal, output } from "@angular/core";
import { blockData } from "../types";

@Component({
    selector: 'block',
    templateUrl: './block.component.html',
    styleUrl: './block.component.css'
})
export class Block {
    realPos = input<Array<number>>([]);
    content = signal<string>("X");
    blockColor = input<string>("");
    positionSetter = output<blockData>()

    changeContent = (piece: string ) => {this.content.set(piece)}

    showPosOnClick = () => {
        console.log(this.realPos())
        this.positionSetter.emit({
            realPos: this.realPos(),
            content: this.content,
        });
    };

};