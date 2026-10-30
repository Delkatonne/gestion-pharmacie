export interface Field {
  key: string; label: string;
  type?: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'password';
  source?: string; optionLabel?: string;           // select alimenté par l'API
  options?: { value: any; label: string }[];       // select statique
  money?: boolean; list?: boolean;
}
export interface CrudConfig {
  title: string; endpoint: string; fields: Field[];
  writeRoles: string[]; warn?: (item: any) => boolean;
}

const STAFF = ['admin', 'pharmacien'];

export const PRODUITS: CrudConfig = {
  title: 'Médicaments', endpoint: '/produits', writeRoles: STAFF,
  warn: p => p.quantite <= p.seuil_alerte,
  fields: [
    { key: 'nom', label: 'Nom' },
    { key: 'code', label: 'Code' },
    { key: 'categorie', label: 'Catégorie' },
    { key: 'prix_achat', label: "Prix d'achat", type: 'number', money: true },
    { key: 'prix_vente', label: 'Prix de vente', type: 'number', money: true },
    { key: 'quantite', label: 'Quantité', type: 'number' },
    { key: 'seuil_alerte', label: "Seuil d'alerte", type: 'number' },
    { key: 'date_peremption', label: 'Péremption', type: 'date' },
    { key: 'ordonnance_requise', label: 'Ordonnance', type: 'checkbox' },
    { key: 'fournisseur_id', label: 'Fournisseur', type: 'select', source: '/fournisseurs', optionLabel: 'nom' },
  ],
};
export const CLIENTS: CrudConfig = {
  title: 'Clients', endpoint: '/clients', writeRoles: ['admin', 'pharmacien', 'vendeur'],
  fields: [{ key: 'nom', label: 'Nom' }, { key: 'telephone', label: 'Téléphone' }, { key: 'email', label: 'Email' }],
};
export const FOURNISSEURS: CrudConfig = {
  title: 'Fournisseurs', endpoint: '/fournisseurs', writeRoles: STAFF,
  fields: [{ key: 'nom', label: 'Nom' }, { key: 'telephone', label: 'Téléphone' },
           { key: 'email', label: 'Email' }, { key: 'adresse', label: 'Adresse' }],
};
export const UTILISATEURS: CrudConfig = {
  title: 'Utilisateurs', endpoint: '/users', writeRoles: ['admin'],
  fields: [
    { key: 'username', label: 'Identifiant' },
    { key: 'nom_complet', label: 'Nom complet' },
    { key: 'role', label: 'Rôle', type: 'select', options: [
      { value: 'admin', label: 'Administrateur' }, { value: 'pharmacien', label: 'Pharmacien' },
      { value: 'vendeur', label: 'Vendeur' }] },
    { key: 'password', label: 'Mot de passe (vide = inchangé)', type: 'password', list: false },
  ],
};
