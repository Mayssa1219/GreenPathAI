export interface Client {
  id?: number;
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  localisation: string;
  photoUrl?: string;
}
