import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Board } from './Board/board.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Board],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chess';

}
