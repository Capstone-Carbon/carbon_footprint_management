from fastapi import FastAPI
import pandas as pd
import numpy as np
from pydantic import BaseModel
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error

# FastAPI 앱 생성
app = FastAPI()

# CSV 데이터 로드
df = pd.read_csv("steps_data.csv")

# 데이터 전처리
X = df.iloc[:, 1:]  # 'steps', 'distance_km', 'calories'
y = np.random.uniform(0.2, 1.5, size=len(df))  # 임의의 탄소 배출량 데이터 (kg)

# 학습/테스트 데이터 분할
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 회귀 모델 학습
model = LinearRegression()
model.fit(X_train, y_train)

# 데이터 입력 형식 정의
class InputData(BaseModel):
    steps: int
    distance_km: float
    calories: int

# 기본 페이지
@app.get("/")
def home():
    return {"message": "탄소 배출량 예측 API에 오신 걸 환영합니다!"}

# 예측 API
@app.post("/predict/")
def predict(data: InputData):
    input_df = pd.DataFrame([[data.steps, data.distance_km, data.calories]], 
                            columns=["steps", "distance_km", "calories"])
    predicted_carbon = model.predict(input_df)[0]
    return {"predicted_carbon_emission": round(predicted_carbon, 4)}

# 모델 성능 확인 API
@app.get("/model_performance/")
def model_performance():
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    return {"MSE": round(mse, 4), "MAE": round(mae, 4)}