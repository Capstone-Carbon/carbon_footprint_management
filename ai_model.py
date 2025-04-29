import pandas as pd
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

# ✅ 데이터 경로 설정
data_path = os.path.join(os.getcwd(), "data", "carbon_emission_data_fixed.csv")

# ✅ 데이터 불러오기 (자차, 버스, 도보만 사용)
df = pd.read_csv(data_path)
df = df[["car_distance", "bus_distance", "walk_distance", "carbon_emission"]]

# ✅ 입력 (X), 출력 (y) 분리
X = df[["car_distance", "bus_distance", "walk_distance"]]
y = df["carbon_emission"]

# ✅ 학습/테스트 데이터셋 분리
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ RandomForest 모델 학습
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ✅ 모델 저장
model_path = os.path.join(os.getcwd(), "data", "carbon_model.pkl")
with open(model_path, "wb") as file:
    pickle.dump(model, file)

print(f"✅ RandomForest 모델 저장 완료! -> {model_path}")
