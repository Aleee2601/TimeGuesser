import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsSnapshot, StoredProgress, StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats: StatsSnapshot = {
    gamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalScore: 0,
    history: []
  };
  progress: StoredProgress | null = null;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.stats = this.storageService.getStats();
    this.progress = this.storageService.getProgress();
  }
}
