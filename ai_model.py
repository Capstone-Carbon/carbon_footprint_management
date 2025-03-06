import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error

# 데이터 불러오기
file_path = "C:/Projects/carbon_footprint_management/data/carbon_emission_data.csv"
df = pd.read_csv(file_path)

# 입력(features)과 출력(target) 설정
X = df[["car_distance", "bus_distance", "bike_distance", "walk_distance", "train_distance"]]  # 이동 거리
y = df["carbon_emission"]  # 탄소 배출량

# 데이터셋을 훈련(train)과 테스트(test) 세트로 분할
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 머신러닝 모델 (선형 회귀) 생성 및 학습
model = LinearRegression()
model.fit(X_train, y_train)

# 테스트 데이터 예측
y_pred = model.predict(X_test)

# 모델 성능 평가
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)

print("✅ 모델 학습 완료!")
print(f"📉 MAE (평균 절대 오차): {mae:.2f}")
print(f"📉 MSE (평균 제곱 오차): {mse:.2f}")
print(f"📉 RMSE (제곱근 평균 제곱 오차): {rmse:.2f}")

# 모델 저장 (추후 API 연동할 때 사용 가능)
import joblib
joblib.dump(model, "C:/Projects/carbon_footprint_management/data/carbon_model.pkl")
print("💾 모델 저장 완료: carbon_model.pkl")
