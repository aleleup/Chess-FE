import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule ],
  templateUrl: './home.component.html',
  standalone: true,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  session =  new FormControl('');
  designatedSession = (Math.random()).toFixed(4).slice(2) 
	private router = inject(Router);
	navToBoard(){
    const sessionId = this.session.value || (this.designatedSession);
		this.router.navigate(['/board', sessionId])
	}
}
