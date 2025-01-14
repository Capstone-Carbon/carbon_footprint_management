import random
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

# 1️⃣ 가상 데이터 생성
data = {
    "electricity_usage": [random.uniform(5, 50) for _ in range(100)],  # 전기 사용량 (kWh)
    "carbon_emissions": [random.uniform(1, 10) for _ in range(100)]  # 탄소 배출량 (kg CO2)
}

# 데이터프레임 생성 및 저장
df = pd.DataFrame(data)
df.to_csv("sample_data.csv", index=False)
print("샘플 데이터 생성 완료!")

# 2️⃣ 생성된 데이터 확인
print("데이터 상위 5개:")
print(df.head())

print("\n데이터 통계 요약:")
print(df.describe())

# 3️⃣ 데이터 시각화
plt.scatter(df["electricity_usage"], df["carbon_emissions"])
plt.xlabel("Electricity Usage (kWh)")
plt.ylabel("Carbon Emissions (kg CO2)")
plt.title("Electricity Usage vs Carbon Emissions")
plt.show()

# 4️⃣ AI 모델 학습
X = df[["electricity_usage"]]  # 입력: 전기 사용량
y = df["carbon_emissions"]     # 출력: 탄소 배출량

# 데이터 분할 (훈련 80%, 테스트 20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 모델 훈련
model = LinearRegression()
model.fit(X_train, y_train)

# 모델 성능 확인
score = model.score(X_test, y_test)
print(f"모델 정확도(R^2): {score:.2f}")

# 테스트 데이터로 예측
predictions = model.predict(X_test)
print("\n테스트 데이터 예측 결과:")
print(predictions[:5])

# 5️⃣ 예측 테스트
new_data = [[25]]  # 예: 전기 사용량 25 kWh
predicted_emission = model.predict(new_data)
print(f"\n전기 사용량 25 kWh에 대한 예상 탄소 배출량: {predicted_emission[0]:.2f} kg CO2")