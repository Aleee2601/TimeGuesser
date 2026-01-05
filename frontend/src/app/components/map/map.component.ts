import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as maplibregl from 'maplibre-gl';

@Component({
    selector: 'app-map',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, OnDestroy, OnChanges {
    @Input() interactive = true;
    @Input() targetLocation: { lat: number; lng: number } | null = null;
    @Input() guessedLocation: { lat: number; lng: number } | null = null;
    @Input() resetKey: number | string | null = null;
    @Output() guess = new EventEmitter<{ lat: number; lng: number }>();

    private map!: maplibregl.Map;
    private guessMarker: maplibregl.Marker | null = null;
    private targetMarker: maplibregl.Marker | null = null;
    private lineLayerId = 'result-line';
    private lineSourceId = 'result-line-source';
    searchQuery = '';
    searchError = '';
    searching = false;

    constructor() { }

    ngOnInit(): void {
        this.initMap();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['targetLocation'] || changes['guessedLocation']) {
            this.updateResultView();
        }

        if (changes['resetKey']) {
            this.searchQuery = '';
            this.searchError = '';
            this.searching = false;
        }

        if (this.map && this.interactive && !this.targetLocation && !this.guessedLocation) {
            this.map.flyTo({ center: [0, 20], zoom: 1 });
        }
    }

    private initMap(): void {
        this.map = new maplibregl.Map({
            container: 'map',
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: [
                            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        ],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap Contributors',
                        maxzoom: 19
                    }
                },
                layers: [
                    {
                        id: 'osm',
                        type: 'raster',
                        source: 'osm'
                    }
                ]
            },
            center: [0, 20],
            zoom: 1
        });

        this.map.on('click', (e) => {
            if (!this.interactive) return;
            this.placeGuessMarker(e.lngLat.lat, e.lngLat.lng);
            this.guess.emit({ lat: e.lngLat.lat, lng: e.lngLat.lng });
        });

        // Initial update if inputs already exist
        this.map.on('load', () => {
            this.updateResultView();
        });
    }

    async onSearch(): Promise<void> {
        const query = this.searchQuery.trim();
        if (!query || !this.map) {
            this.searchError = query ? '' : 'Please enter a city or country.';
            return;
        }

        this.searching = true;
        this.searchError = '';

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const results = await response.json();

            if (!Array.isArray(results) || results.length === 0) {
                this.searchError = 'No results found.';
                return;
            }

            const match = results[0];
            const lat = parseFloat(match.lat);
            const lng = parseFloat(match.lon);

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                this.searchError = 'Invalid location result.';
                return;
            }

            this.map.flyTo({ center: [lng, lat], zoom: 8 });
        } catch {
            this.searchError = 'Search failed. Please try again.';
        } finally {
            this.searching = false;
        }
    }

    private placeGuessMarker(lat: number, lng: number): void {
        if (this.guessMarker) {
            this.guessMarker.setLngLat([lng, lat]);
        } else {
            const color = this.getCssVariable('--accent') || '#f97316';
            this.guessMarker = new maplibregl.Marker({ color })
                .setLngLat([lng, lat])
                .addTo(this.map);
        }
    }

    private updateResultView(): void {
        if (!this.map) return;

        // Clear existing
        if (this.targetMarker) {
            this.targetMarker.remove();
            this.targetMarker = null;
        }


        if (this.guessedLocation) {
            this.placeGuessMarker(this.guessedLocation.lat, this.guessedLocation.lng);
        } else if (this.guessMarker) {
            this.guessMarker.remove();
            this.guessMarker = null;
        }

        if (this.targetLocation && !this.interactive) {
            // Add target marker
            const color = this.getCssVariable('--primary') || '#14b8a6';
            this.targetMarker = new maplibregl.Marker({ color })
                .setLngLat([this.targetLocation.lng, this.targetLocation.lat])
                .addTo(this.map);

            // Draw line if we have both
            if (this.guessedLocation) {
                this.drawLine(
                    [this.guessedLocation.lng, this.guessedLocation.lat],
                    [this.targetLocation.lng, this.targetLocation.lat]
                );

                // Fit bounds
                const bounds = new maplibregl.LngLatBounds()
                    .extend([this.guessedLocation.lng, this.guessedLocation.lat])
                    .extend([this.targetLocation.lng, this.targetLocation.lat]);

                this.map.fitBounds(bounds, { padding: 50 });
            }
        } else {
            // Remove line if exists
            if (this.map.getLayer(this.lineLayerId)) {
                this.map.removeLayer(this.lineLayerId);
            }
            if (this.map.getSource(this.lineSourceId)) {
                this.map.removeSource(this.lineSourceId);
            }

        }
    }

    private drawLine(start: [number, number], end: [number, number]): void {
        if (this.map.getSource(this.lineSourceId)) {
            (this.map.getSource(this.lineSourceId) as maplibregl.GeoJSONSource).setData({
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: [start, end]
                }
            });
        } else {
            this.map.addSource(this.lineSourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: [start, end]
                    }
                }
            });

            this.map.addLayer({
                id: this.lineLayerId,
                type: 'line',
                source: this.lineSourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': this.getCssVariable('--text-main') || '#0f172a',
                    'line-width': 4,
                    'line-dasharray': [2, 1]
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
        }
    }

    private getCssVariable(name: string): string {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
}
