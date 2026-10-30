from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..security import (create_token, hash_password, verify_password, require_roles, get_current_user)

router = APIRouter(prefix="/auth", tags=["auth"])
users = APIRouter(prefix="/users", tags=["users"])


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(401, "Identifiant ou mot de passe incorrect")
    return {
        "access_token": create_token(user.username, user.role),
        "token_type": "bearer",
        "role": user.role,
        "nom": user.nom_complet or user.username,
    }


@router.get("/me", response_model=schemas.UserOut)
def me(user=Depends(get_current_user)):
    return user


@users.get("", response_model=list[schemas.UserOut])
def lister(db: Session = Depends(get_db), _=Depends(require_roles("admin"))):
    return db.query(models.User).order_by(models.User.id).all()


@users.post("", response_model=schemas.UserOut, status_code=201)
def creer(data: schemas.UserIn, db: Session = Depends(get_db), _=Depends(require_roles("admin"))):
    if not data.password:
        raise HTTPException(400, "Mot de passe obligatoire")
    if data.role not in ("admin", "pharmacien", "vendeur"):
        raise HTTPException(400, "Rôle invalide")
    if db.query(models.User).filter_by(username=data.username).first():
        raise HTTPException(409, "Identifiant déjà utilisé")
    u = models.User(username=data.username, nom_complet=data.nom_complet,
                    role=data.role, password_hash=hash_password(data.password))
    db.add(u); db.commit(); db.refresh(u)
    return u


@users.put("/{uid}", response_model=schemas.UserOut)
def modifier(uid: int, data: schemas.UserIn, db: Session = Depends(get_db), _=Depends(require_roles("admin"))):
    u = db.get(models.User, uid)
    if not u:
        raise HTTPException(404, "Introuvable")
    u.username, u.nom_complet, u.role = data.username, data.nom_complet, data.role
    if data.password:
        u.password_hash = hash_password(data.password)
    db.commit(); db.refresh(u)
    return u


@users.delete("/{uid}", status_code=204)
def supprimer(uid: int, db: Session = Depends(get_db), me=Depends(require_roles("admin"))):
    if uid == me.id:
        raise HTTPException(400, "Vous ne pouvez pas supprimer votre propre compte")
    u = db.get(models.User, uid)
    if u:
        db.delete(u); db.commit()
