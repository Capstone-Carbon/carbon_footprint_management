import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error

# 📌 CSV 데이터 불러오기
df = pd.read_csv("steps_data.csv")

# 📌 날짜 제거 후, 입력(X)과 타겟(Y) 설정
X = df.iloc[:, 1:]  # 'steps', 'distance_km', 'calories'
y = np.random.uniform(0.2, 1.5, size=len(df))  # 임의의 탄소 배출량 데이터 (kg)

# 📌 데이터 분할 (80% 학습, 20% 테스트)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 📌 회귀 모델 학습
model = LinearRegression()
model.fit(X_train, y_train)

# 📌 예측 수행
y_pred = model.predict(X_test)

# 📌 모델 성능 평가
mse = mean_squared_error(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

# 📌 결과 출력
print(f"📌 모델 성능 평가:")
print(f"✅ MSE (평균제곱오차): {mse:.4f}")
print(f"✅ MAE (평균절대오차): {mae:.4f}")

# 📌 샘플 예측 (새로운 데이터)
sample_data = np.array([[8000, 5.2, 280]])  # 걸음 수 8000, 이동 거리 5.2km, 칼로리 280kcal
predicted_carbon = model.predict(sample_data)[0]
print(f"\n🌍 예상 탄소 배출량: {predicted_carbon:.4f} kg CO₂")