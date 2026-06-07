import { Component, input, signal, WritableSignal } from '@angular/core';
import { preBlock, Message } from '../types';
import { Block } from '../Block/block.component';
import { PawnUpgradeModalComponent } from '../pawn-upgrade-modal/pawn-upgrade-modal.component';

@Component({
  selector: 'board',
  imports: [Block, PawnUpgradeModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})

export class Board {
    teamId = input<number>();
    fromBlock = signal<preBlock | null>(null);
    contentSelected: string = '';
	boardStructure: preBlock[][] = [];
	typeOfMovement: string = "";
	pawnUpgrade = signal<string | null>(null);
	showPawnUpgradeModal = signal<boolean>(false);

	ngOnInit() {
		for(let i = 0; i < 8; i++){
			const row: Array<preBlock> = [];
			const colors = ["WHITE", "BLACK"];

			for (let j = 0; j < 8; j++) {
				row.push({
					color:colors[(i+j) % 2], 
					realPos: [i, j],
					content: signal<string>(""),
					isSelected: signal<boolean>(false)
				})
			}
			this.boardStructure.push(row)
		}
		if (this.teamId() === 1) {
			this.boardStructure.forEach(arr => arr.reverse());
			this.boardStructure.reverse()
		}			
		this.setPiecesInBoard()
		console.log(this.boardStructure)

	}  
    
    async handlePositionClicked(realPos: number[]){
		let relativePos = realPos;
		if (this.teamId() === 1) relativePos = this.reverseVector(realPos);
      	console.log("New pos recived: " , realPos, relativePos)
		const blockSelected: preBlock = this.boardStructure[relativePos[0]][relativePos[1]]
		console.log("Block content: ", blockSelected.content());
		if (this.fromBlock() === null && blockSelected.content()){
			this.fromBlock.set(blockSelected)
			blockSelected.isSelected.set(true)	
		}
		// if (this.fromBlock() !== null &&this.fromBlock() === blockSelected) {
		// 	this.dropPrevData(null)
		// }
		else {
			
			this.setTypeOfMovement(blockSelected);
			if (this.typeOfMovement === "PAWN_UPGRADE") {
				this.showPawnUpgradeModal.set(true)
				await this.waitToCloseModal()
			}
			const body: Message = {
				typeOfMove: this.typeOfMovement,
				currentPos: this.fromBlock()?.realPos || [], //Ts sucks
 				newPos: blockSelected.realPos,
				pawnUpgrade: this.pawnUpgrade(),
				playerId: this.teamId() || 0,
				timeStamp: 100
			} 
			console.log("BODY: ", body)
			// If response.wasLegalMove == true
			blockSelected.content.set(this.fromBlock()?.content() || "");
			this.fromBlock()?.content.set("");
			this.fromBlock()?.isSelected.set(false);
			this.fromBlock.set(null)
		};

    }

	dropPrevData(event: MouseEvent | null) {
		console.log("DROP FROM DATA");
		event?.preventDefault();
		this.fromBlock()?.isSelected.set(false);
		this.fromBlock.set(null);
	}

	movePiece(from: Array<number>, to: Array<number>) {
		
		this.boardStructure[to[0]][to[1]].content.set(this.boardStructure[from[0]][from[1]].content())		
		this.boardStructure[from[0]][from[1]].content.set("")		

	}

	reverseVector(vector: Array<number>) {
		const map = [7,6,5,4,3,2,1,0];
		return [map[vector[0]], map[vector[1]]];
	}

	setTypeOfMovement(blockSelected: preBlock) {
		if (["wK", "bK"].includes(this.fromBlock()?.content() || "") && ["wR", "bR"].includes(blockSelected.content() || "")) {
			this.typeOfMovement = "CASTLE";
		}
		else if ((this.fromBlock()?.content() === "wP" && blockSelected.realPos[0] === 0) || 
		(this.fromBlock()?.content() === "bP" && blockSelected.realPos[0] === 7)){
			this.typeOfMovement = "PAWN_UPGRADE"
		}
		else this.typeOfMovement = "MOVE"

		console.log("TYPE OF MOVE: ", this.typeOfMovement)
	}

	setPiecesInBoard() {
			
			const pawnRrows = [1,6];
			const piecesRows = [0,7]
			const colorInitials =  ["b", "w"]
			const teamId = this.teamId() || 0
			pawnRrows.forEach((r, i) => {
				const initial = colorInitials[(i+teamId) % 2]
				this.boardStructure[r].forEach(block => block.content.set(`${initial}P`));				
			})
			piecesRows.forEach((r, i) => {
				const initial = colorInitials[(i+teamId) % 2]
				this.boardStructure[r][0].content.set(`${initial}R`)
				this.boardStructure[r][7].content.set(`${initial}R`)
				this.boardStructure[r][1].content.set(`${initial}Kn`);
				this.boardStructure[r][6].content.set(`${initial}Kn`);

				this.boardStructure[r][2].content.set(`${initial}B`);
				this.boardStructure[r][5].content.set(`${initial}B`);

				this.boardStructure[r][3].content.set(`${initial}Q`);
				this.boardStructure[r][4].content.set(`${initial}K`);
				
				
			})

	}

	async waitToCloseModal() {
		const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
		while(this.showPawnUpgradeModal()) {
			console.log("Waiting user response")
			await wait(500)
		}
	}
}
