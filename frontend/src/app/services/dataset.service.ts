import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimePhoto } from '../models/time-photo.model';

@Injectable({
  providedIn: 'root'
})
export class DatasetService {

  private dataUrl = 'assets/data/time-photos.json';

  constructor(private http: HttpClient) { }

  getAllPhotos(): Observable<TimePhoto[]> {
    return this.http.get<TimePhoto[]>(this.dataUrl);
  }

  getRandomPhoto(): Observable<TimePhoto> {
    return new Observable(observer => {
      this.getAllPhotos().subscribe(photos => {
        const random = photos[Math.floor(Math.random() * photos.length)];
        observer.next(random);
        observer.complete();
      });
    });
  }

  getPhotoById(id: string): Observable<TimePhoto | undefined> {
    return new Observable(observer => {
      this.getAllPhotos().subscribe(photos => {
        const found = photos.find(p => p.id === id);
        observer.next(found);
        observer.complete();
      });
    });
  }
}
