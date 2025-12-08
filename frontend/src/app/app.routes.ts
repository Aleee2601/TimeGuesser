import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; 
import { SettingsComponent } from './components/settings/settings.component';
import { GameShellComponent } from './components/game-shell/game-shell.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'game', component: GameShellComponent },
  { path: '**', redirectTo: '' }
]
