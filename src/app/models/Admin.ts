export interface Admin {
  id: string | number;
  email: string;
  nom?: string;
  prenom?: string;
  role: string;
  photoUrl?: string;
}
