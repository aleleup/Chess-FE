import { Component, input, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'game-over-modal',
  imports: [ ],
  templateUrl: './game-over-modal.component.html',
  standalone: true,
  styleUrl: './game-over-modal.component.css'
})
export class GameOverModalComponent {
    router = inject(Router);
    isTie = input<boolean>();
    winnerId = input<number>();
    reasson = input<string>();
    winnerColor: string = ''

    ngOnInit(){
        if (this.isTie()) return;
        this.winnerColor = this.winnerId() === 0 ? 'WHITE' : 'BLACK'
    }

    getBack() {
        this.router.navigate(['/'])
    }

}
