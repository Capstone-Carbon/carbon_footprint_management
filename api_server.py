from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import pickle
import tensorflow as tf
import numpy as np
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ CORS 설정 (React와 통신 가능하도록)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ SQLite3 DB 연결 설정
DB_PATH = os.path.join("users.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 결과를 딕셔너리 형태로 반환
    return conn

def initialize_database():
    """
    ✅ FastAPI 실행 시 users 테이블이 없으면 자동으로 생성
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            car_distance REAL DEFAULT 0,
            bus_distance REAL DEFAULT 0,
            walk_distance REAL DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

# ✅ 서버 시작 시 DB 초기화
initialize_database()

# ✅ AI 모델 로드
MODEL_PATH_PKL = os.path.join("data", "best_carbon_model.pkl")
MODEL_PATH_KERAS = os.path.join("data", "best_carbon_model.keras")

def load_model():
    if os.path.exists(MODEL_PATH_PKL):
        print("✅ 랜덤 포레스트 모델 로드 중...")
        with open(MODEL_PATH_PKL, "rb") as file:
            return pickle.load(file), "Random Forest"

    elif os.path.exists(MODEL_PATH_KERAS):
        print("✅ 신경망(MLP) 모델 로드 중...")
        return tf.keras.models.load_model(MODEL_PATH_KERAS, compile=False), "Neural Network (MLP)"

    else:
        raise FileNotFoundError("❌ 저장된 모델을 찾을 수 없습니다!")

model, model_type = load_model()
print(f"🚀 로드된 모델: {model_type}")

# ✅ 기본 API
@app.get("/")
def read_root():
    return {"message": "Carbon Footprint Prediction API is running!", "model": model_type}

# ✅ 사용자 이동 데이터 조회 API
@app.get("/user_data")
def get_user_data(user_id: str):
    """
    📌 DB에서 특정 사용자의 이동 데이터를 가져오거나, 없으면 기본값으로 새 사용자 생성
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT car_distance, bus_distance, walk_distance FROM users WHERE username = ?", (user_id,))
    row = cursor.fetchone()

    # ✅ 사용자가 없으면 기본값으로 자동 추가
    if row is None:
        cursor.execute(
            "INSERT INTO users (username, car_distance, bus_distance, walk_distance) VALUES (?, 0, 0, 0)",
            (user_id,)
        )
        conn.commit()
        row = {"car_distance": 0, "bus_distance": 0, "walk_distance": 0}

    conn.close()
    return row

# ✅ 사용자 이동 데이터 업데이트 API
class UserUpdateInput(BaseModel):
    user_id: str
    car_distance: float
    bus_distance: float
    walk_distance: float

@app.post("/update_user_data")
def update_user_data(data: UserUpdateInput):
    """
    📌 사용자의 이동 데이터를 업데이트하거나, 없으면 새 사용자 추가
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (data.user_id,))
    existing_user = cursor.fetchone()

    if existing_user:
        cursor.execute(
            "UPDATE users SET car_distance = ?, bus_distance = ?, walk_distance = ? WHERE username = ?",
            (data.car_distance, data.bus_distance, data.walk_distance, data.user_id),
        )
    else:
        cursor.execute(
            "INSERT INTO users (username, car_distance, bus_distance, walk_distance) VALUES (?, ?, ?, ?)",
            (data.user_id, data.car_distance, data.bus_distance, data.walk_distance),
        )

    conn.commit()
    conn.close()
    
    return {"message": "✅ 사용자 이동 데이터가 성공적으로 업데이트되었습니다."}

# ✅ 예측 API
class PredictionInput(BaseModel):
    car_distance: float
    bus_distance: float
    walk_distance: float

@app.post("/predict")
def predict_emission(data: PredictionInput):
    """
    📌 입력된 이동 거리 데이터를 바탕으로 탄소 배출량을 예측
    """
    input_data = np.array([[data.car_distance, data.bus_distance, data.walk_distance]])

    if model_type == "Random Forest":
        predicted_emission = model.predict(input_data)[0]
    else:
        predicted_emission = model.predict(input_data)[0][0]

    return {"predicted_emission": round(float(predicted_emission), 2)}

@app.post("/recommend")
def recommend(data: PredictionInput):
    """
    📌 사용자의 이동 데이터를 기반으로 맞춤형 탄소 절감 추천을 제공 (향상된 버전)
    """
    car = data.car_distance
    bus = data.bus_distance
    walk = data.walk_distance
    total_distance = car + bus + walk

    # ✅ AI 모델로 예측된 탄소 배출량(g 단위)
    input_data = np.array([[car, bus, walk]])
    if model_type == "Random Forest":
        emission = model.predict(input_data)[0]
    else:
        emission = model.predict(input_data)[0][0]

    emission = float(emission)
    emission_kg = emission / 1000  # g → kg

    # ✅ 통계 기반 참고값
    daily_avg_emission_kr = 7000 / 365  # kg (약 19.2kg)
    daily_avg_emission_world = 13000 / 365  # kg (약 35.6kg)
    trees_needed = emission_kg / 8  # 나무 1그루당 연간 8kg CO2 흡수

    recommendations = []

    # ✅ 전체 배출량 분석
    if emission_kg > daily_avg_emission_world:
        recommendations.append(f"🌍 탄소 배출량이 세계 평균({daily_avg_emission_world:.1f}kg)보다 높습니다.")
    elif emission_kg > daily_avg_emission_kr:
        recommendations.append(f"🇰🇷 탄소 배출량이 한국 평균({daily_avg_emission_kr:.1f}kg)보다 높습니다.")
    else:
        recommendations.append("✅ 현재 이동 습관은 평균보다 친환경적입니다. 잘 하고 계세요!")

    # ✅ 나무 상쇄량 안내
    recommendations.append(f"🌲 배출된 탄소를 상쇄하려면 약 {trees_needed:.1f}그루의 나무가 필요합니다.")

    # ✅ 자가용 사용 비율 분석
    if total_distance > 0:
        car_ratio = car / total_distance
        if car_ratio > 0.6:
            recommendations.append(f"🚗 자가용 비중이 {car_ratio*100:.1f}%입니다. 대중교통 또는 도보로 일부 대체해보세요.")
        elif car_ratio < 0.3:
            recommendations.append("👍 자가용 의존도가 낮습니다. 훌륭해요!")

    # ✅ 도보 거리 매우 짧은 경우
    if walk < 3:
        recommendations.append("👣 도보 거리가 매우 짧습니다. 하루 10분 걷기부터 시작해보세요.")

    # ✅ 대중교통 위주일 경우 칭찬
    if bus > car and bus > walk:
        recommendations.append("🚌 대중교통 중심의 이동 습관을 유지하고 계시네요! 아주 좋아요!")

    # ✅ 도보 위주일 경우 칭찬
    if walk > car and walk > bus:
        recommendations.append("💪 도보 위주의 이동으로 환경에 크게 기여하고 있습니다!")

    # ✅ 기본 안내
    if not recommendations:
        recommendations.append("🌿 지속 가능한 이동 습관을 유지해보세요.")

    return {
        "predicted_emission_kg": round(emission_kg, 2),
        "trees_needed": round(trees_needed, 1),
        "recommendations": recommendations
    }



##   fastapi 실행 코드드
##  $ uvicorn api_server:app --reload --host 127.0.0.1 --port 8000  