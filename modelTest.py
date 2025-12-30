import pickle
import pandas as pd
import numpy as np

def main():
    with open("istanbulHousePriceModel.pkl", "rb") as f:
        savedData = pickle.load(f)

    pipeline = savedData["pipeline"]
    target_transform = savedData.get("target_transform", None)

    X_test = pd.read_csv("data/CleanedHomeSaleData_Xtest.csv")
    y_pred_log = pipeline.predict(X_test)

    if target_transform == "log1p":
        y_pred = np.expm1(y_pred_log)
    else:
        y_pred = y_pred_log

    print(y_pred[:10])

if __name__ == "__main__":
    main()
