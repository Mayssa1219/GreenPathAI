export interface Client {
  id?: number;
  prenom?: string;
  nom?: string;
  fullname?: string;
  email: string;
  motDePasse: string;
  localisation: string;
  photoUrl?: string;
  preferences?: string[];
  statut?: string;
  natureScore?: number;
  cultureScore?: number;
  sportScore?: number;
  ecoScore?: number;
  dureePreferee?: number;
  favoris?: number[];
  lieuxVisites?: number[];
}
