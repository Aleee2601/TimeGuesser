export interface TimePhoto {
    id: string;
    imageUrl: string;
    year: number;

    lat: number;
    lng: number;

    country: string;
    city?: string;

    description?: string;
}
