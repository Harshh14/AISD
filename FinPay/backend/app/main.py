import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.database import engine, Base, SessionLocal
import app.models  # Register all models with Base.metadata
from app.routers import auth, wallet, merchants, payments, cashback, admin
from app.utils.seed_data import seed_initial_data

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="FinPay – Campus Digital Wallet API",
    description="Campus Digital Wallet and Cashback Management System for College AI Lab",
    version="1.0.0"
)

# CORS middleware for frontend Fetch API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(wallet.router)
app.include_router(merchants.router)
app.include_router(payments.router)
app.include_router(cashback.router)
app.include_router(admin.router)

# Automatic seed on startup
@app.on_event("startup")
def startup_event():
    if os.getenv("TESTING") == "1":
        return
    db = SessionLocal()
    try:
        seed_initial_data(db)
    except Exception as e:
        print(f"[FinPay Startup] Seed error: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/health")
def health():
    return {"status": "ok", "service": "FinPay API"}

# Mount frontend files at root (index.html, css/, js/, student/, merchant/, admin/)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    def root():
        return {"message": "FinPay API is running. Visit /docs for Swagger UI."}
