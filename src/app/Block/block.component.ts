import { Component, input, signal, output } from "@angular/core";
import { blockData  } from "../types";

@Component({
    selector: 'block',
    templateUrl: './block.component.html',
    styleUrl: './block.component.css'
})
export class Block {
    realPos = input<Array<number>>([]);
    contentInput = input<string>("")
    content = signal<string>(this.contentInput());
    blockColor = input<string>("");
    positionSetter = output<blockData>()

    ngOnInit() {
        this.content.set(this.contentInput());
    }

    showPosOnClick = () => {
        
        console.log(this.realPos())
        this.positionSetter.emit({
            realPos: this.realPos(),
            content: this.content,
        });
    };

};