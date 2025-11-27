import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Import RouterLink for the HTML button

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink], 
  templateUrl: './home.component.html', // Fixed: added .component
  styleUrl: './home.component.css'      // Fixed: added .component
})
export class HomeComponent { 
  // Class name is HomeComponent
}
