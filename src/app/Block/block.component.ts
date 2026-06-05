import { Component, input, signal, output, WritableSignal } from "@angular/core";

@Component({
    selector: 'block',
    templateUrl: './block.component.html',
    styleUrl: './block.component.css'
})
export class Block {
    realPos = input<number[]>([]);
    content = input<WritableSignal<string>>(signal<string>(""))
    blockColor = input<string>("");
    isSelected = input<WritableSignal<boolean>>(signal<boolean>(false));
    positionSetter = output<number[]>()

    showPosOnClick() {
        console.log(this.realPos())
        this.positionSetter.emit(this.realPos());
    };

};