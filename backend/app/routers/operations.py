from datetime import date, datetime, time, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..security import get_current_user, require_roles

router = APIRouter(tags=["operations"])


@router.get("/ventes", response_model=list[schemas.VenteOut])
def lister_ventes(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Vente).order_by(models.Vente.id.desc()).limit(200).all()


@router.post("/ventes", response_model=schemas.VenteOut, status_code=201)
def creer_vente(data: schemas.VenteIn, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not data.lignes:
        raise HTTPException(400, "Le panier est vide")
    vente = models.Vente(client_id=data.client_id, user_id=user.id,
                         mode_paiement=data.mode_paiement, total=0)
    total = 0.0
    for l in data.lignes:
        p = db.get(models.Produit, l.produit_id)
        if not p:
            raise HTTPException(404, f"Produit {l.produit_id} introuvable")
        if p.date_peremption and p.date_peremption < date.today():
            raise HTTPException(400, f"{p.nom} est périmé : vente refusée")
        if p.quantite < l.quantite:
            raise HTTPException(400, f"Stock insuffisant pour {p.nom} (disponible : {p.quantite})")
        p.quantite -= l.quantite
        vente.lignes.append(models.LigneVente(produit_id=p.id, quantite=l.quantite, prix_unitaire=p.prix_vente))
        total += p.prix_vente * l.quantite
    vente.total = total
    db.add(vente)
    db.commit()
    db.refresh(vente)
    return vente


@router.delete("/ventes/{vid}", status_code=204)
def annuler_vente(vid: int, db: Session = Depends(get_db), _=Depends(require_roles("admin", "pharmacien"))):
    v = db.get(models.Vente, vid)
    if not v:
        raise HTTPException(404, "Introuvable")
    for l in v.lignes:  # remet le stock
        if l.produit:
            l.produit.quantite += l.quantite
    db.delete(v)
    db.commit()


@router.get("/approvisionnements", response_model=list[schemas.ApproOut])
def lister_appro(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(models.Approvisionnement).order_by(models.Approvisionnement.id.desc()).limit(200).all()


@router.post("/approvisionnements", response_model=schemas.ApproOut, status_code=201)
def creer_appro(data: schemas.ApproIn, db: Session = Depends(get_db), _=Depends(require_roles("admin", "pharmacien"))):
    p = db.get(models.Produit, data.produit_id)
    if not p:
        raise HTTPException(404, "Produit introuvable")
    p.quantite += data.quantite
    if data.prix_achat:
        p.prix_achat = data.prix_achat
    a = models.Approvisionnement(**data.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    today = date.today()
    debut = datetime.combine(today, time.min)

    def ca(d1, d2):
        return db.query(func.coalesce(func.sum(models.Vente.total), 0)).filter(
            models.Vente.date >= d1, models.Vente.date < d2).scalar()

    sept_jours = []
    for i in range(6, -1, -1):
        d = datetime.combine(today - timedelta(days=i), time.min)
        sept_jours.append({"jour": d.strftime("%d/%m"), "ca": ca(d, d + timedelta(days=1))})

    bas = db.query(models.Produit).filter(models.Produit.quantite <= models.Produit.seuil_alerte)\
        .order_by(models.Produit.quantite).limit(10).all()
    limite = today + timedelta(days=60)
    peremption = db.query(models.Produit).filter(
        models.Produit.date_peremption.isnot(None), models.Produit.date_peremption <= limite)\
        .order_by(models.Produit.date_peremption).limit(10).all()
    return {
        "ca_jour": ca(debut, debut + timedelta(days=1)),
        "nb_ventes_jour": db.query(models.Vente).filter(models.Vente.date >= debut).count(),
        "nb_produits": db.query(models.Produit).count(),
        "valeur_stock": db.query(func.coalesce(func.sum(models.Produit.quantite * models.Produit.prix_achat), 0)).scalar(),
        "sept_jours": sept_jours,
        "stock_bas": [{"nom": p.nom, "quantite": p.quantite, "seuil": p.seuil_alerte} for p in bas],
        "peremption": [{"nom": p.nom, "date": p.date_peremption.isoformat(),
                        "perime": p.date_peremption < today} for p in peremption],
    }
