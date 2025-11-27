import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { DatasetService } from '../../services/dataset.service';
import { TimePhoto } from '../../models/time-photo.model';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  currentPhoto?: TimePhoto;
  gameMode: string = 'relaxed'; // default
  
  // Game State
  round: number = 1;
  maxRounds: number = 5;
  score: number = 0;
  
  // User Inputs
  guessedYear: number | null = null;

  constructor(
    private datasetService: DatasetService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // 1. Check which mode was selected in Settings
    this.route.queryParams.subscribe(params => {
      this.gameMode = params['mode'] || 'relaxed';
    });

    // 2. Load the first photo
    this.loadNewPhoto();
  }

  loadNewPhoto() {
    this.datasetService.getRandomPhoto().subscribe(photo => {
      this.currentPhoto = photo;
    });
  }

  // Placeholder for when user clicks "Submit Guess"
  makeGuess() {
    if (!this.guessedYear || !this.currentPhoto) return;
    
    // Logic to calculate score will go here
    console.log(`Guessed: ${this.guessedYear}, Actual: ${this.currentPhoto.year}`);
    
    // Move to next round logic...
  }
}