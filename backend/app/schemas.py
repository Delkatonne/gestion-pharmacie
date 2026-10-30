from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class FournisseurIn(BaseModel):
    nom: str
    telephone: Optional[str] = None
    email: Optional[str] = None
    adresse: Optional[str] = None


class FournisseurOut(FournisseurIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ClientIn(BaseModel):
    nom: str
    telephone: Optional[str] = None
    email: Optional[str] = None


class ClientOut(ClientIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class ProduitIn(BaseModel):
    nom: str
    code: Optional[str] = None
    categorie: Optional[str] = None
    prix_achat: float = Field(0, ge=0)
    prix_vente: float = Field(ge=0)
    quantite: int = Field(0, ge=0)
    seuil_alerte: int = Field(10, ge=0)
    date_peremption: Optional[date] = None
    ordonnance_requise: bool = False
    fournisseur_id: Optional[int] = None


class ProduitOut(ProduitIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


class UserIn(BaseModel):
    username: str
    nom_complet: Optional[str] = None
    role: str = "vendeur"
    password: Optional[str] = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    nom_complet: Optional[str] = None
    role: str


class LigneIn(BaseModel):
    produit_id: int
    quantite: int = Field(gt=0)


class VenteIn(BaseModel):
    client_id: Optional[int] = None
    mode_paiement: str = "especes"
    lignes: list[LigneIn]


class LigneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    produit_id: int
    produit_nom: Optional[str] = None
    quantite: int
    prix_unitaire: float


class VenteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    date: datetime
    client_id: Optional[int] = None
    client_nom: Optional[str] = None
    vendeur: Optional[str] = None
    total: float
    mode_paiement: str
    lignes: list[LigneOut]


class ApproIn(BaseModel):
    produit_id: int
    fournisseur_id: Optional[int] = None
    quantite: int = Field(gt=0)
    prix_achat: float = Field(0, ge=0)


class ApproOut(ApproIn):
    model_config = ConfigDict(from_attributes=True)
    id: int
    date: datetime
    produit_nom: Optional[str] = None
    fournisseur_nom: Optional[str] = None
