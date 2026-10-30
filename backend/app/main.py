import os
from datetime import date, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import Base, engine, SessionLocal
from . import models, schemas
from .security import hash_password
from .routers import auth, operations
from .routers.crud import make_crud

Base.metadata.create_all(engine)

app = FastAPI(title="Pharmacie – API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:4200"],
                   allow_methods=["*"], allow_headers=["*"])

ALL = ("admin", "pharmacien", "vendeur")
app.include_router(auth.router, prefix="/api")
app.include_router(auth.users, prefix="/api")
app.include_router(make_crud("/produits", models.Produit, schemas.ProduitIn, schemas.ProduitOut), prefix="/api")
app.include_router(make_crud("/fournisseurs", models.Fournisseur, schemas.FournisseurIn, schemas.FournisseurOut), prefix="/api")
app.include_router(make_crud("/clients", models.Client, schemas.ClientIn, schemas.ClientOut, write_roles=ALL), prefix="/api")
app.include_router(operations.router, prefix="/api")


def seed():
    db = SessionLocal()
    try:
        if db.query(models.User).count() == 0:
            db.add_all([
                models.User(username="admin", nom_complet="Administrateur", role="admin", password_hash=hash_password("admin123")),
                models.User(username="pharmacien", nom_complet="Pharmacien", role="pharmacien", password_hash=hash_password("pharma123")),
                models.User(username="vendeur", nom_complet="Vendeur", role="vendeur", password_hash=hash_password("vendeur123")),
            ])
            f = models.Fournisseur(nom="Grossiste Pharma Bénin", telephone="+229 00 00 00 00", adresse="Cotonou")
            db.add(f); db.flush()
            db.add_all([
                models.Produit(nom="Paracétamol 500 mg", code="PARA500", categorie="Antalgique", prix_achat=300, prix_vente=500, quantite=120, seuil_alerte=20, date_peremption=date.today() + timedelta(days=400), fournisseur_id=f.id),
                models.Produit(nom="Amoxicilline 500 mg", code="AMOX500", categorie="Antibiotique", prix_achat=900, prix_vente=1500, quantite=8, seuil_alerte=15, date_peremption=date.today() + timedelta(days=45), ordonnance_requise=True, fournisseur_id=f.id),
                models.Produit(nom="Sérum physiologique", code="SERUM", categorie="Soin", prix_achat=150, prix_vente=300, quantite=60, seuil_alerte=10, fournisseur_id=f.id),
            ])
            db.add(models.Client(nom="Client comptoir"))
            db.commit()
    finally:
        db.close()


seed()

# Sert le frontend Angular compilé s'il existe (déploiement en un seul serveur)
DIST = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist", "pharmacie", "browser")
class SPAStaticFiles(StaticFiles):
    """Renvoie index.html pour les routes Angular (rafraîchissement de page)."""
    async def get_response(self, path, scope):
        try:
            return await super().get_response(path, scope)
        except Exception:
            return await super().get_response("index.html", scope)


if os.path.isdir(DIST):
    app.mount("/", SPAStaticFiles(directory=DIST, html=True), name="frontend")
