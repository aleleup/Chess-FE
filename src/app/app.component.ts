import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Block } from './Block/block.component';
import { blockData } from './types';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Block],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chess';
  positionClicked: Array<number> = [];
  contentSelected: string = '';

  handlePositionClicked = (position: blockData) => {
    console.log("New pos recived: " , position)
    this.positionClicked = position.realPos;
    position.content.set("Y") // Accesing position data!!!
  }
}
