import joblib
import numpy as np
import pandas as pd

# 저장된 모델 불러오기
model_path = "./data/carbon_model.pkl"
model = joblib.load(model_path)

# 새로운 입력 데이터 (예: 자가용 20km, 버스 10km, 자전거 5km, 도보 2km, 기차 15km 이동)
new_data = pd.DataFrame([[20, 10, 5, 2, 15]], columns=["car_distance", "bus_distance", "bike_distance", "walk_distance", "train_distance"])

# 예측 실행
predicted_emission = model.predict(new_data)[0]

print(f"🚗 예측된 탄소 배출량: {predicted_emission:.2f} g CO₂")
