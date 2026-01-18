import pickle
import pandas as pd
import numpy as np
import os


def main():
    CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

    ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))

    MODEL_PATH = os.path.join(
        ROOT_DIR, "models", "istanbulHousePriceModel.pkl"
    )

    X_TEST_PATH = os.path.join(
        ROOT_DIR, "data", "processed", "CleanedHomeSaleData_Xtest.csv"
    )

    with open(MODEL_PATH, "rb") as f:
        savedData = pickle.load(f)

    pipeline = savedData["pipeline"]
    target_transform = savedData.get("target_transform", None)

    X_test = pd.read_csv(X_TEST_PATH)
    y_pred_log = pipeline.predict(X_test)

    if target_transform == "log1p":
        y_pred = np.expm1(y_pred_log)
    else:
        y_pred = y_pred_log

    print(y_pred[:10])


if __name__ == "__main__":
    main()
