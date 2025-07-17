export interface Circuit {
  id: number;
  titre: string;
  description: string;
  etapes?: string;
  duree?: number;
  niveauEcoresponsabilite?: number;
  photoUrl?: string;
  status?: string;
  createdAt?: string;
  tags?: string[];
  lieux?: any[];
  guide?: { id: number; nom?: string };
  proposePar?: { id: number; nom?: string };
}
