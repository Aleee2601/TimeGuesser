import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; 
import { SettingsComponent } from './components/settings/settings.component';
import { GameShellComponent } from './components/game-shell/game-shell.component';
import { StatsComponent } from './components/stats/stats.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'game', component: GameShellComponent },
  { path: 'stats', component: StatsComponent },
  { path: '**', redirectTo: '' }
]
