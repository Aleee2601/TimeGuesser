import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings.component.html', // Fixed: added .component
  styleUrl: './settings.component.css'      // Fixed: added .component
})
export class SettingsComponent {
  // Class name is SettingsComponent
}