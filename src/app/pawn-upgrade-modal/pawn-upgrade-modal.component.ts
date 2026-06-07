import { Component, WritableSignal, input, } from '@angular/core';

@Component({
  selector: 'pawn-upgrade-modal',
  imports: [],
  templateUrl: './pawn-upgrade-modal.component.html',
  styleUrl: './pawn-upgrade-modal.component.css'
})
export class PawnUpgradeModalComponent {
    showModal = input<WritableSignal<boolean> | null>(null)
    pieceSelected = input<WritableSignal<string | null> | null>(null)
    teamId = input<number>();
    content: string[][] = []

    ngOnInit() {
        const prefix = this.teamId() === 0 ? "w" : "b";
        this.content.push([`${prefix}Q`, `${prefix}R`])
        this.content.push([`${prefix}Kn`, `${prefix}B`])

    }

    handlePieceSelected(pieceSelected: string) {
        console.log("PAWN UPGRADES TO: ", pieceSelected)
        this.pieceSelected()?.set(pieceSelected);
        this.showModal()?.set(false);
    } 
}
