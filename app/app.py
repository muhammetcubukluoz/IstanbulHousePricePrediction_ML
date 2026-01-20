from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pickle
import pandas as pd
import numpy as np
from pydantic import BaseModel
import uvicorn
import os
import json

# PATH
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
MODEL_PATH = os.path.join(BASE_DIR, "..", "models", "istanbulHousePriceModel.pkl")
NEIGHBORHOODS_PATH = os.path.join(BASE_DIR, "neighborhoods.json")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static dosyaları serve et
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Model yükleme
with open(MODEL_PATH, "rb") as f:
    saved_data = pickle.load(f)

pipeline = saved_data["pipeline"]
target_transform = saved_data.get("target_transform", None)

# Mahalle verileri yükleme
with open(NEIGHBORHOODS_PATH, "r", encoding="utf-8") as f:
    NEIGHBORHOODS = json.load(f)


class HouseFeatures(BaseModel):
    District: str
    Neighborhood: str
    m2_Net: float
    Livingroom_number: int
    Room_number: float
    Building_Age: str
    Floor_location: int
    Number_of_floors: int
    Heating: str
    Number_of_bathrooms: int
    Available_for_Loan: str
    From_who: str
    Front_West: int
    Front_East: int
    Front_South: int
    Front_North: int
    Internet: int
    Security_Alarm: int
    Smart_House: int
    Elevator: int
    Balcony: int
    Car_Park: int
    Laminate_Floor: int
    Luxury_Facilities: int
    Airport: int
    Marmaray: int
    Metro: int
    Metrobus: int
    Minibus: int
    Bus_stop: int
    Tram: int
    Railway_station: int
    TEM: int
    E_5: int


# Ana sayfa
@app.get("/")
async def read_root():
    return FileResponse(os.path.join(TEMPLATES_DIR, "index.html"))


# Mahalle endpoint
@app.get("/api/neighborhoods")
async def get_neighborhoods(district: str):
    # /api/neighborhoods?district=Kadıköy
    neighborhoods = NEIGHBORHOODS.get(district, [])
    return {
        "district": district,
        "neighborhoods": neighborhoods
    }


# Tahmin endpoint
@app.post("/predict")
async def predict(features: HouseFeatures):
    try:
        input_data = pd.DataFrame([features.model_dump()])

        # Kolon isimlerini düzelt
        input_data.rename(
            columns={
                "m2_Net": "m2_(Net)",
                "E_5": "E-5"
            },
            inplace=True
        )

        # Log transform
        input_data["m2_(Net)"] = np.log1p(input_data["m2_(Net)"])

        # Tahmin yap
        y_pred_log = pipeline.predict(input_data)

        # Log transform geri al
        if target_transform == "log1p":
            y_pred = np.expm1(y_pred_log)
        else:
            y_pred = y_pred_log

        return {
            "predicted_price_TL": float(y_pred[0])
        }
    except Exception as e:
        return {
            "error": str(e),
            "predicted_price_TL": 0
        }


if __name__ == "__main__":
    uvicorn.run("app.app:app", host="0.0.0.0", port=8000, reload=True)
