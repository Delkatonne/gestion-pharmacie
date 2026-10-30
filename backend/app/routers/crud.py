from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..database import get_db
from ..security import get_current_user, require_roles


def make_crud(prefix, Model, In, Out, write_roles=("admin", "pharmacien")):
    r = APIRouter(prefix=prefix, tags=[prefix.strip("/")])

    @r.get("", response_model=list[Out])
    def lister(db: Session = Depends(get_db), user=Depends(get_current_user)):
        return db.query(Model).order_by(Model.id.desc()).all()

    @r.post("", response_model=Out, status_code=201)
    def creer(data: In, db: Session = Depends(get_db), user=Depends(require_roles(*write_roles))):
        obj = Model(**data.model_dump())
        db.add(obj)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(409, "Valeur déjà existante (code ou nom en doublon)")
        db.refresh(obj)
        return obj

    @r.put("/{item_id}", response_model=Out)
    def modifier(item_id: int, data: In, db: Session = Depends(get_db), user=Depends(require_roles(*write_roles))):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(404, "Introuvable")
        for k, v in data.model_dump().items():
            setattr(obj, k, v)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(409, "Valeur déjà existante")
        db.refresh(obj)
        return obj

    @r.delete("/{item_id}", status_code=204)
    def supprimer(item_id: int, db: Session = Depends(get_db), user=Depends(require_roles(*write_roles))):
        obj = db.get(Model, item_id)
        if not obj:
            raise HTTPException(404, "Introuvable")
        db.delete(obj)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(409, "Suppression impossible : élément utilisé ailleurs")

    return r
