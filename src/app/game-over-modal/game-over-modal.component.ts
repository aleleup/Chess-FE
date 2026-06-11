import { Component, input } from '@angular/core';

@Component({
  selector: 'game-over-modal',
  imports: [],
  templateUrl: './game-over-modal.component.html',
  styleUrl: './game-over-modal.component.css'
})
export class GameOverModalComponent {
    isTie = input<boolean>();
    winnerId = input<number>();
    reasson = input<string>();
    winnerColor: string = ''

    ngOnInit(){
        if (this.isTie()) return;
        this.winnerColor = this.winnerId() === 0 ? 'WHITE' : 'BLACK'
    }

}
