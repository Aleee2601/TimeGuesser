import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; 
import { SettingsComponent } from './components/settings/settings.component';
import { GameComponent } from './components/game/game.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'game', component: GameComponent },
  { path: '**', redirectTo: '' }
]
