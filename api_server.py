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
MODEL_PATH_PKL = os.path.join("data", "carbon_model.pkl")
MODEL_PATH_KERAS = os.path.join("data", "best_carbon_model.keras")

def load_model():
    # if os.path.exists(MODEL_PATH_PKL):
    #     print("✅ 랜덤 포레스트 모델 로드 중...")
    #     with open(MODEL_PATH_PKL, "rb") as file:
    #         return pickle.load(file), "Random Forest"

    if os.path.exists(MODEL_PATH_KERAS):
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

    if total_distance == 0:
        return {
            "predicted_emission_kg": 0.0,
            "trees_needed": 0.0,
            "recommendations": ["❗ 이동 거리 정보가 없습니다. 이동 데이터를 먼저 입력해주세요."]
        }

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

    # 📊 비유형 소개
    recommendations.append(f"📊 오늘의 탄소 배출량은 약 {emission_kg:.2f}kg CO₂입니다.")
    if emission_kg >= 15:
        recommendations.append("📦 항공 택배 1개 받는 것과 비슷한 수준이에요.")
    elif emission_kg >= 10:
        recommendations.append("⛽ 휘발유 약 4리터를 소비한 탄소량과 비슷해요.")
    elif emission_kg >= 5:
        recommendations.append("🌬️ 에어컨을 하루 종일 틀었을 때와 같은 탄소 배출이에요.")
    elif emission_kg >= 2:
        recommendations.append("📱 스마트폰을 1년 충전한 것과 맞먹는 양이에요.")

    # 🌍 평균 비교 설명
    if emission_kg > daily_avg_emission_world:
        recommendations.append("🌡️ 세계 평균보다 높은 탄소 배출이에요. 내일은 대중교통을 이용해보는 건 어떨까요?")
    elif emission_kg > daily_avg_emission_kr:
        recommendations.append("📉 한국 평균보다 살짝 높아요. 이번 주는 자가용 줄이기에 도전해보세요!")
    else:
        recommendations.append("🌿 평균보다 친환경적인 습관이에요. 계속 이어가볼까요?")

    # ✂️ 시뮬레이션 절감 제안
    sim_input = np.array([[max(car - 5, 0), bus + 3, walk + 2]])
    sim_emission = model.predict(sim_input)[0] if model_type == "Random Forest" else model.predict(sim_input)[0][0]
    saved_emission = (emission - sim_emission) / 1000
    if saved_emission > 0.3:
        recommendations.append(f"✂️ 자가용을 5km 줄이면 약 {saved_emission:.2f}kg CO₂를 절감할 수 있어요!")

    # 📆 월별 누적 탄소 예측
    monthly_emission = emission_kg * 30
    recommendations.append(f"📅 지금과 같은 습관을 유지하면 한 달간 약 {monthly_emission:.1f}kg의 탄소가 배출됩니다.")

    # ✅ 도보 거리 매우 짧은 경우
    if walk < 3:
        recommendations.append("👣 도보 거리가 매우 짧습니다. 하루 10분 걷기부터 시작해보세요.")

    # 🚶 도보 분석
    if walk < 2:
        recommendations.append("👣 오늘 단 10분 걷기를 도전해보세요!")
    elif walk < 4:
        recommendations.append("🚶 한 정거장 미리 내려 걷는 습관, 생각보다 효과 커요.")
    if walk / total_distance < 0.1:
        recommendations.append("💡 도보 비율이 낮아요. 가까운 거리부터 걸어보는 건 어떨까요?")

    # ✅ 자가용 사용 비율 분석
    if total_distance > 0:
        car_ratio = car / total_distance
        if car_ratio > 0.6:
            recommendations.append(f"🚗 자가용 비중이 {car_ratio*100:.1f}%입니다. 대중교통 또는 도보로 일부 대체해보세요.")
        elif car_ratio < 0.3:
            recommendations.append("👍 자가용 의존도가 낮습니다. 훌륭해요!")

    # 🚗 자가용 비율
    car_ratio = car / total_distance
    if car_ratio > 0.7:
        recommendations.append("🛻 자가용 의존도가 매우 높아요. 대중교통 활용에 도전해보세요!")
    elif car_ratio > 0.5:
        recommendations.append("🚗 자가용 중심의 이동 습관이네요. 일부 구간만 바꿔도 달라져요.")
    elif car_ratio < 0.3:
        recommendations.append("👍 자가용 사용 비율이 낮아요. 잘 실천하고 계시네요!")

    # ✅ 대중교통 위주일 경우 칭찬
    if bus > car and bus > walk:
        recommendations.append("🚌 대중교통 중심의 이동 습관을 유지하고 계시네요! 아주 좋아요!")

    # 🚌 칭찬
    if bus > car and bus > walk:
        recommendations.append("🚌 대중교통을 잘 활용하고 있어요. 멋져요!")

    # ✅ 도보 위주일 경우 칭찬
    if walk > car and walk > bus:
        recommendations.append("💪 도보 위주의 이동으로 환경에 크게 기여하고 있습니다!")

    # 💪 도보 칭찬
    if walk > car and walk > bus:
        recommendations.append("💪 도보 중심의 이동 습관, 훌륭합니다!")

    # ✅ 기본 안내
    if not recommendations:
        recommendations.append("🌿 지속 가능한 이동 습관을 유지해보세요.")

    return {
        "predicted_emission_kg": round(emission_kg, 2),
        "trees_needed": round(trees_needed, 1),
        "recommendations": recommendations
    }



## uvicorn api_server:app --host 127.0.0.1 --port 8000 --reload