import { Component, input, signal } from '@angular/core';
import { blockData, preBlock } from '../types';
import { Block } from '../Block/block.component';

@Component({
  selector: 'board',
  imports: [Block],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class Board {
    teamId = input<number>();
    fromBlock = signal<blockData | null>(null);
    contentSelected: string = '';
	boardStructure: Array<Array<preBlock>> = []

	ngOnInit() {
		// TODO: construct board for black team
		for(let i = 0; i < 8; i++){
			const row: Array<preBlock> = [];
			const colors = ["WHITE", "BLACK"];

			for (let j = 0; j < 8; j++) {
				row.push({
					color:colors[(i+j) % 2], 
					realPos: [i, j],
					content: ""
				})
			}
			this.boardStructure.push(row)
		}
		if (this.teamId() === 1) {
			this.boardStructure.forEach(arr => arr.reverse());
			this.boardStructure.reverse()
		}			
		this.setPiecesInBoard(this.boardStructure, this.teamId() || 0)

		console.log(this.boardStructure)

	}  
    
    handlePositionClicked(block: blockData){
      	console.log("New pos recived: " , block)
		console.log("Block content: ", block.content());
		if (this.fromBlock() === null) this.fromBlock.set(block);
		else {
			block?.content.set(this.fromBlock()?.content() || "");
			this.fromBlock()?.content.set("");
			this.fromBlock.set(null)
		};

	  //   position.content.set("X") // Accesing position data!!!
    }


	setPiecesInBoard(boardStructure: Array<Array<preBlock>>, teamId: number) {
			
			const pawnRrows = [1,6];
			const piecesRows = [0,7]
			const colorInitials =  ["b", "w"]
			pawnRrows.forEach((r, i) => {
				const initial = colorInitials[(i+teamId) % 2]
				this.boardStructure[r].forEach(block => block.content=`${initial}P`);				
			})
			piecesRows.forEach((r, i) => {
				const initial = colorInitials[(i+teamId) % 2]
				this.boardStructure[r][0].content =`${initial}R`
				this.boardStructure[r][7].content =`${initial}R`

				this.boardStructure[r][1].content =`${initial}Kn`;
				this.boardStructure[r][6].content =`${initial}Kn`;

				this.boardStructure[r][2].content =`${initial}B`;
				this.boardStructure[r][5].content =`${initial}B`;

				this.boardStructure[r][3].content =`${initial}Q`;
				this.boardStructure[r][4].content =`${initial}K`;
				
				
			})


	}
}
