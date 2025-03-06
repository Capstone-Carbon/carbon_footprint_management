from fastapi import FastAPI
import joblib
import pandas as pd

# FastAPI 앱 생성
app = FastAPI()

# 저장된 모델 불러오기
model_path = "C:/Projects/carbon_footprint_management/data/carbon_model.pkl"
model = joblib.load(model_path)

@app.get("/")
def home():
    return {"message": "🚀 탄소 배출량 예측 API가 실행 중입니다!"}

@app.get("/predict")
def predict_emission(car: float, bus: float, bike: float, walk: float, train: float):
    # 입력 데이터를 DataFrame으로 변환
    input_data = pd.DataFrame([[car, bus, bike, walk, train]], 
                              columns=["car_distance", "bus_distance", "bike_distance", "walk_distance", "train_distance"])

    # AI 모델을 사용한 예측
    predicted_emission = model.predict(input_data)[0]

    return {"predicted_emission": f"{predicted_emission:.2f} g CO₂"}
