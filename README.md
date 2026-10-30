# 💊 Gestion de Pharmacie — FastAPI (Python) + Angular 18

Application web complète de gestion de pharmacie.

## Fonctionnalités
- **Authentification JWT** avec 3 rôles : `admin`, `pharmacien`, `vendeur`
- **Médicaments** : code, catégorie, prix d'achat/vente, stock, seuil d'alerte, date de péremption, ordonnance, fournisseur
- **Ventes (caisse)** : recherche, panier, client, mode de paiement (espèces / Mobile Money / carte) ; décrémente le stock, refuse les produits périmés ou en stock insuffisant ; annulation (remet le stock)
- **Approvisionnements** : entrées de stock + mise à jour du prix d'achat
- **Clients, Fournisseurs, Utilisateurs** (gestion des comptes réservée à l'admin)
- **Tableau de bord** : CA du jour, nombre de ventes, valeur du stock, graphique 7 jours, alertes stock bas et péremptions (60 jours)
- Montants en FCFA

## Comptes de démonstration (créés au 1er lancement)
| Identifiant | Mot de passe | Rôle |
|---|---|---|
| admin | admin123 | admin |
| pharmacien | pharma123 | pharmacien |
| vendeur | vendeur123 | vendeur |

⚠️ Changez ces mots de passe et définissez `SECRET_KEY` avant toute mise en production.

## Lancement en développement
**Backend** (Python 3.10+) :
```bash
cd backend
python -m venv venv && source venv/bin/activate     # Windows : venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Documentation interactive de l'API : http://localhost:8000/docs

**Frontend** (Node 18.19+ ou 20+) dans un second terminal :
```bash
cd frontend
npm install
npm start
```
Ouvrir http://localhost:4200 (les appels `/api` sont redirigés vers le port 8000).

## Déploiement en un seul serveur
```bash
cd frontend && npm install && npm run build
cd ../backend && uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Si `frontend/dist/pharmacie/browser` existe, FastAPI sert l'application Angular sur http://localhost:8000.

## Configuration (variables d'environnement)
- `SECRET_KEY` : clé de signature des jetons JWT
- `DATABASE_URL` : défaut `sqlite:///./pharmacie.db` (ex. PostgreSQL : `postgresql://user:pwd@host/db`, + `pip install psycopg2-binary`)

## Structure
```
backend/app/   main.py, models.py, schemas.py, security.py, routers/{auth,crud,operations}.py
frontend/src/app/   core/ (API, intercepteur, guard)  pages/ (login, dashboard, ventes, approvisionnements, crud générique)
```
