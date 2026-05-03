from fastapi import FastAPI, Depends, HTTPException, status, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pyotp
import qrcode
import io
import base64

from . import models, schemas, auth
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Palantir Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_current_user(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    payload = auth.verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return user

@app.post("/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/auth/login")
def login(user_credentials: schemas.UserLogin, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if user.is_2fa_enabled:
        return {"requires_2fa": True, "email": user.email}

    access_token = auth.create_access_token(data={"sub": user.id})
    refresh_token = auth.create_refresh_token(data={"sub": user.id})

    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")
    
    return {"message": "Logged in successfully", "user": {"id": user.id, "email": user.email, "role": user.role}}

@app.post("/auth/verify-otp")
def verify_otp(otp_data: schemas.OTPVerify, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == otp_data.email).first()
    if not user or not user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="Invalid request")

    totp = pyotp.TOTP(user.otp_secret)
    if not totp.verify(otp_data.otp_code):
        raise HTTPException(status_code=401, detail="Invalid OTP code")

    access_token = auth.create_access_token(data={"sub": user.id})
    refresh_token = auth.create_refresh_token(data={"sub": user.id})

    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax")
    
    return {"message": "Logged in successfully"}

@app.post("/auth/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    payload = auth.verify_token(refresh_token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
        
    access_token = auth.create_access_token(data={"sub": user_id})
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax")
    
    return {"message": "Token refreshed"}

@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out successfully"}

@app.get("/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/auth/enable-2fa")
def enable_2fa(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_2fa_enabled:
        raise HTTPException(status_code=400, detail="2FA is already enabled")
        
    secret = pyotp.random_base32()
    current_user.otp_secret = secret
    db.commit()
    
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(name=current_user.email, issuer_name="PalantirApp")
    
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {"secret": secret, "qr_code": f"data:image/png;base64,{img_str}"}

@app.post("/auth/confirm-2fa")
def confirm_2fa(otp_data: dict, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    otp_code = otp_data.get("otp_code")
    if not otp_code or not current_user.otp_secret:
        raise HTTPException(status_code=400, detail="Invalid request")
        
    totp = pyotp.TOTP(current_user.otp_secret)
    if not totp.verify(otp_code):
        raise HTTPException(status_code=401, detail="Invalid OTP code")
        
    current_user.is_2fa_enabled = True
    db.commit()
    return {"message": "2FA successfully enabled"}
