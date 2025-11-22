import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DatasetService } from './services/dataset.service';
import { TimePhoto } from './models/time-photo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {

  // folosit în template
  title = 'frontend';

  constructor(private dataset: DatasetService) { }

  ngOnInit(): void {
    this.dataset.getAllPhotos().subscribe((data: TimePhoto[]) => {
      console.log('Loaded photos:', data);
    });
  }
}
