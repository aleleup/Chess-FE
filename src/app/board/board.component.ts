import { Component, input } from '@angular/core';
import { blockData, preBlock } from '../types';
import { Block } from '../Block/block.component';

@Component({
  selector: 'board',
  imports: [Block],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class Board {
    teamId = input<number>(0);
    positionClicked: Array<number> = [];
    contentSelected: string = '';
	boardStructure: Array<Array<preBlock>> = []

	constructor() {
		// TODO: construct board for black team
		for(let i = 0; i < 8; i++){
			const row: Array<preBlock> = [];
			const colors = ["WHITE", "BLACK"];

			for (let j = 0; j < 8; j++) {
				row.push({
					color:colors[(i+j) % 2], 
					realPos: [i, j]
				})
			}
			this.boardStructure.push(row)
		}
		console.log(this.boardStructure)
	}  
    
    handlePositionClicked(position: blockData){
      console.log("New pos recived: " , position)
      this.positionClicked = position.realPos;
      position.content.set("Y") // Accesing position data!!!
    }
}
