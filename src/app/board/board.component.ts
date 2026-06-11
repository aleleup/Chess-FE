import { Component, signal, inject } from '@angular/core';
import { preBlock, Message, BrodCastMessage, ConnectionMessage, GameOverData } from '../types';
import { Block } from '../Block/block.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PawnUpgradeModalComponent } from '../pawn-upgrade-modal/pawn-upgrade-modal.component';
import { WebsocketService } from '../../Services/WebSocket.service';
import { GameOverModalComponent } from '../game-over-modal/game-over-modal.component';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'board',
  imports: [Block, PawnUpgradeModalComponent, GameOverModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})

export class Board {
	teamId = signal<number>(0);

	fromBlock = signal<preBlock | null>(null);
	toBlock = signal<preBlock | null>(null);
	toBlockPrevContent = ""

	contentSelected: string = '';
	boardStructure: (preBlock)[][] = [];
	typeOfMovement: string = "";
	pawnUpgrade = signal<string | null>(null);
	showPawnUpgradeModal = signal<boolean>(false);
	showWarning = signal<boolean>(false);
	wsService = inject(WebsocketService	);
	showBoard = signal<boolean>(false);
	connectionMessage = signal<string>("");

	isMyTurn = signal<boolean>(false);

	MOVE = "MOVE";
	CASTLE = "CASTLE";
	PAWN_UPGRADE = "PAWN_UPGRADE";

	gameOverData: GameOverData | null = null;  
	isGameOver = signal<boolean>(false) 
	private route = inject(ActivatedRoute);
	sessionId: string | null = '';


	ngOnInit() {
		this.sessionId = this.route.snapshot.paramMap.get('id');
		console.log('El ID de la sesión es:', this.sessionId);
  	}

	constructor() {
		this.wsService.init("/board");

		this.wsService.listenMessages()?.pipe(takeUntilDestroyed())
		?.subscribe({
			next: (msg) => this.handleMessages(msg),
			error: (err) => console.error('Error en componente:', err)
		});

	}

	handleMessages(msg: Object) {
		if (this.isConnectionMessage(msg)){
			this.startBoard(msg)
		}
		if (this.isBrodcastMessage(msg)) {
			this.handleBrodcastMessage(msg)
		}

	}


	startBoard(msg: ConnectionMessage) {
		this.connectionMessage.set(msg.message)
		if (!msg.success) return
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
		console.log("BOARD CREATED")
		if (msg.id === 1) {
			// this.boardStructure.forEach(arr => arr.reverse());
			this.boardStructure.reverse()
		}			
		console.log("BOARD REVERSED IF NECESARY")
		this.teamId.set(msg.id)
		this.setPiecesInBoard()
		console.log("SETING SHOWBOARD TO TRUE")
		// this.boardStructure = x;
		this.isMyTurn.set(msg.id === 0)

		this.showBoard.set(true);

	
	}  
    
    async handlePositionClicked(realPos: number[]){
		let relativePos = realPos;
		console.log("New pos recived: " , realPos, relativePos)
		
		if (!this.isMyTurn()) return;

		if (this.teamId() === 1) relativePos = this.reverseFirstIndex(realPos);
		const blockSelected: preBlock = this.boardStructure[relativePos[0]][relativePos[1]]
		console.log("Block content: ", blockSelected.content());

		if (this.fromBlock() === null &&
			((this.teamId() === 0 && blockSelected.content().includes("b")) || 
			(this.teamId() === 1 && blockSelected.content().includes("w")))
		) return

		if (this.fromBlock() === null && blockSelected.content()){
			
			this.fromBlock.set(blockSelected)
			blockSelected.isSelected.set(true)	
		}
		// if (this.fromBlock() !== null &&this.fromBlock() === blockSelected) {
		// 	this.dropPrevData(null)
		// }
		else {
			// Identify what the user wants to do
			this.setTypeOfMovement(blockSelected);
			if (this.typeOfMovement === this.PAWN_UPGRADE) {
				// Await until the user selected the pawn upgrade
				this.showPawnUpgradeModal.set(true)
				await this.waitToCloseModal()
			}
			// Moveing the piece (if it is not a legal move, then we are moveing things as they were)
			// This to give the clear impression that what the user did was wrong
			this.toBlock.set(blockSelected)
			this.toBlockPrevContent = blockSelected.content();
			if(this.typeOfMovement === this.MOVE){	
				blockSelected.content.set(this.fromBlock()?.content() || "");
				this.fromBlock()?.content.set("");
			}
			this.fromBlock()?.isSelected.set(false);
			// Sending the message to the webSocket.
			const body: Message = {
				typeOfMove: this.typeOfMovement,
				currentPos: this.fromBlock()?.realPos || [], //Ts sucks
				newPos: blockSelected.realPos,
				pawnUpgrade: this.pawnUpgrade(),
				playerId: this.teamId() || 0,
				timeStamp: 100
			} 
			this.sendBodyToServer(body)
		};

    }
	async handleBrodcastMessage(msg: BrodCastMessage){

		if (msg.gameOverData !== null) {
			this.isGameOver.set(true);
			this.gameOverData = msg.gameOverData;
			this.wsService.disconnect()
		}

		if (msg.prevTypeOfMove === this.MOVE){
			if (msg.playerTurn === this.teamId() && !msg.wasLegalMove){
				
				await this.showErrorSignal()
				// Roll back to previous state.
				const fromBlockContent: string = this.toBlock()?.content() || "";
				this.fromBlock()?.content.set(fromBlockContent);
				this.toBlock()?.content.set(this.toBlockPrevContent);
				
			}
			else if (!this.isResponseToMyMessage(msg.playerTurn) && msg.wasLegalMove) this.movePiece(msg.previousPos, msg.newPos) 

		}	


		if (msg.prevTypeOfMove === this.CASTLE) {
			if ( msg.castelingData === null) this.isResponseToMyMessage(msg.playerTurn) && await this.showErrorSignal() // ¬msg.castelingData  <==> ¬msg.wasLegalMove
			else {
				const kingPos = msg.castelingData.kingPos;
				const rookPos = msg.castelingData.rookPos;
				this.movePiece(msg.newPos || [], rookPos);
				this.movePiece(msg.previousPos|| [], kingPos);
			}
		}

		if (msg.prevTypeOfMove === this.PAWN_UPGRADE) {
			if (!msg.wasLegalMove && this.isResponseToMyMessage(msg.playerTurn)) await this.showErrorSignal();
			this.movePiece(msg.previousPos, msg.newPos);
			const pawnUpgrade = (msg.playerTurn + 1) % 2 === 0 ? `w${msg.pawnUpgrade}` : `b${msg.pawnUpgrade}`
			const x = this.teamId() === 0 ? msg.newPos :  this.reverseFirstIndex(msg.newPos)
			this.boardStructure[x[0]][x[1]].content.set(pawnUpgrade);
		}

		this.fromBlock.set(null)
		this.toBlock.set(null)
		this.toBlockPrevContent = ""
		this.isMyTurn.set(msg.playerTurn === this.teamId())
	}

	dropPrevData(event: MouseEvent | null) {
		console.log("DROP FROM DATA");
		event?.preventDefault();
		this.fromBlock()?.isSelected.set(false);
		this.fromBlock.set(null);
	}

	movePiece(from: number[], to: number[]) {
		let fromArr: number[] = from;
		let toArr: number[] = to;

		if (this.teamId() === 1) {fromArr = this.reverseFirstIndex(from); toArr =  this.reverseFirstIndex(to)};
		this.boardStructure[toArr[0]][toArr[1]].content.set(this.boardStructure[fromArr[0]][fromArr[1]].content());		
		this.boardStructure[fromArr[0]][fromArr[1]].content.set("");	

	}



	setTypeOfMovement(blockSelected: preBlock) {
		if (["wK", "bK"].includes(this.fromBlock()?.content() || "") && ["wR", "bR"].includes(blockSelected.content() || "")) {
			this.typeOfMovement = this.CASTLE;
		}
		else if ((this.fromBlock()?.content() === "wP" && blockSelected.realPos[0] === 0) || 
		(this.fromBlock()?.content() === "bP" && blockSelected.realPos[0] === 7)){
			this.typeOfMovement = this.PAWN_UPGRADE
		}
		else this.typeOfMovement = this.MOVE

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

	async sendBodyToServer(body: Message) {
		console.log("BODY: ", body);
		this.wsService.sendMessage(body)
		
	}

	isBrodcastMessage(msg: any): msg is BrodCastMessage {
		return msg && typeof msg === 'object' && (
			'wasLegalMove' in msg &&
			'playerTurn' in msg &&
			'gameOverData' in msg &&
			'previousPos' in msg &&
			'newPos' in msg &&
			'pawnUpgrade' in msg &&
			'castelingData' in msg &&
			'prevTypeOfMove' in msg

		)
	}
	isConnectionMessage(msg: any): msg is ConnectionMessage {
		return msg && typeof msg === 'object' && (
			'success' in msg &&
			'id' in msg &&
			'message' in msg 
		)
	}

	isResponseToMyMessage(playerTurn: number): boolean {
		// If player turn == (teamId + 1) % 2 => the message has been a success and now it is not my turn. 
		return this.teamId() !== playerTurn;
	}

	reverseFirstIndex(vector: number[]) {
		const map = [7,6,5,4,3,2,1,0];
		return [map[vector[0]], vector[1]];

	}

	async showErrorSignal(){
		const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
		this.showWarning.set(true)
		await wait(750);
		this.showWarning.set(false)
	}
}
