from fastapi import FastAPI
import pickle
import pandas as pd
import numpy as np
from pydantic import BaseModel

app = FastAPI()

with open("istanbulHousePriceModel.pkl", "rb") as f:
    saved_data = pickle.load(f)

pipeline = saved_data["pipeline"]
target_transform = saved_data.get("target_transform", None)

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

# endpoint
@app.post("/predict")
async def predict(features: HouseFeatures):

    input_data = pd.DataFrame([features.model_dump()])

    input_data.rename(
        columns={
            "m2_Net": "m2_(Net)",
            "E_5": "E-5"
        },
        inplace=True
    )

    # Log transform
    input_data["m2_(Net)"] = np.log1p(input_data["m2_(Net)"])
    y_pred_log = pipeline.predict(input_data)

    # Log transform
    if target_transform == "log1p":
        y_pred = np.expm1(y_pred_log)
    else:
        y_pred = y_pred_log

    return {
        "predicted_price_TL": float(y_pred[0])
    }