import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocalisationService {
  getPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('La géolocalisation n’est pas supportée par ce navigateur.');
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }
    });
  }

  async getCityFromCoords(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`);

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      // Récupération brute de la ville/localité
      let rawCity =
        address.city ||
        address.town ||
        address.village ||
        address.state_district ||  // Ex: "Délégation Djerba Houmet Souk"
        address.state ||           // Ex: "Gouvernorat Médenine"
        'Tunis';

      console.log('📍 Localité brute obtenue :', rawCity);

      // Nettoyage : suppression des mots inutiles ou administratifs
      rawCity = rawCity
        .replace(/Délégation|Gouvernorat|District|Commune|Municipalité|Ville|de|du|la/gi, '')
        .trim();

      // On prend le premier mot pour éviter les chaînes trop longues
      const cleanCity = rawCity.split(' ')[0] || 'Tunis';

      console.log('📍 Localité nettoyée pour météo :', cleanCity);

      return cleanCity;

    } catch (error) {
      console.error('❌ Erreur lors de la géolocalisation :', error);
      return 'Tunis';  // fallback simple sur Tunis (ville connue par OpenWeatherMap)
    }
  }
}
