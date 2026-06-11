import { Component, input } from '@angular/core';

@Component({
  selector: 'piece',
  imports: [],
  templateUrl: './piece.component.html',
  styleUrl: './piece.component.css'
})
export class Piece {
    key = input<string>()
}
