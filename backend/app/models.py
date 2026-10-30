from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False, index=True)
    nom_complet = Column(String)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="vendeur")  # admin | pharmacien | vendeur


class Fournisseur(Base):
    __tablename__ = "fournisseurs"
    id = Column(Integer, primary_key=True)
    nom = Column(String, nullable=False)
    telephone = Column(String)
    email = Column(String)
    adresse = Column(String)


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True)
    nom = Column(String, nullable=False)
    telephone = Column(String)
    email = Column(String)


class Produit(Base):
    __tablename__ = "produits"
    id = Column(Integer, primary_key=True)
    nom = Column(String, nullable=False, index=True)
    code = Column(String, unique=True, nullable=True)
    categorie = Column(String)
    prix_achat = Column(Float, default=0)
    prix_vente = Column(Float, nullable=False)
    quantite = Column(Integer, default=0)
    seuil_alerte = Column(Integer, default=10)
    date_peremption = Column(Date, nullable=True)
    ordonnance_requise = Column(Boolean, default=False)
    fournisseur_id = Column(Integer, ForeignKey("fournisseurs.id"), nullable=True)
    fournisseur = relationship("Fournisseur")


class Vente(Base):
    __tablename__ = "ventes"
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total = Column(Float, default=0)
    mode_paiement = Column(String, default="especes")
    lignes = relationship("LigneVente", cascade="all, delete-orphan")
    client = relationship("Client")
    user = relationship("User")

    @property
    def client_nom(self):
        return self.client.nom if self.client else None

    @property
    def vendeur(self):
        return self.user.username if self.user else None


class LigneVente(Base):
    __tablename__ = "lignes_vente"
    id = Column(Integer, primary_key=True)
    vente_id = Column(Integer, ForeignKey("ventes.id"))
    produit_id = Column(Integer, ForeignKey("produits.id"))
    quantite = Column(Integer, nullable=False)
    prix_unitaire = Column(Float, nullable=False)
    produit = relationship("Produit")

    @property
    def produit_nom(self):
        return self.produit.nom if self.produit else None


class Approvisionnement(Base):
    __tablename__ = "approvisionnements"
    id = Column(Integer, primary_key=True)
    date = Column(DateTime, default=datetime.utcnow)
    produit_id = Column(Integer, ForeignKey("produits.id"), nullable=False)
    fournisseur_id = Column(Integer, ForeignKey("fournisseurs.id"), nullable=True)
    quantite = Column(Integer, nullable=False)
    prix_achat = Column(Float, default=0)
    produit = relationship("Produit")
    fournisseur = relationship("Fournisseur")

    @property
    def produit_nom(self):
        return self.produit.nom if self.produit else None

    @property
    def fournisseur_nom(self):
        return self.fournisseur.nom if self.fournisseur else None
