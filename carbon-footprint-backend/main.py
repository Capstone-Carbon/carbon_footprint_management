from fastapi import FastAPI, HTTPException, Query, Request  # FastAPI 임포트
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import sqlite3
import os
import logging
from datetime import datetime, date

app = FastAPI()  # FastAPI 객체 생성

# ✅ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 로깅 설정
logging.basicConfig(level=logging.DEBUG)

# ✅ 모델 로드
MODEL_PATH = os.path.join(os.path.dirname(__file__), "data", "best_carbon_model.pkl")
try:
    with open(MODEL_PATH, "rb") as file:
        model = pickle.load(file)
    print("✅ 모델 로드 성공!")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")

# ✅ SQLite 데이터베이스 연결 함수
def get_db():
    conn = sqlite3.connect("./user_datas.db")
    conn.row_factory = sqlite3.Row
    return conn

# ✅ 데이터베이스 테이블 생성
def initialize_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            latitude REAL,
            longitude REAL,
            speed REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS daily_emissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            emission REAL,
            date TEXT
        )
    """)
    conn.commit()
    conn.close()

initialize_db()

# ✅ 데이터 모델 정의
class CarbonFootprintRequest(BaseModel):
    car: float
    bus: float
    walk: float

class LocationData(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    speed: float

class DailyEmission(BaseModel):
    user_id: int
    emission: float

# ✅ 위치 데이터 저장 API
@app.post("/location")
def receive_location(loc: LocationData):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO locations (user_id, latitude, longitude, speed, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (loc.user_id, loc.latitude, loc.longitude, loc.speed, datetime.now()))
    conn.commit()
    conn.close()
    print(f"✅ 위치 저장 | 사용자: {loc.user_id}, 속도: {loc.speed:.2f} km/h, 위도: {loc.latitude}, 경도: {loc.longitude}")
    return {"message": "위치 및 속도 저장 완료!"}

# ✅ 사용자 데이터 관리
USER_DATA_DB = {
    "user1": {"car": 20, "bus": 15, "walk": 4},
    "user2": {"car": 10, "bus": 20, "walk": 10},
}

@app.get("/user_data")
async def get_user_data(user_id: str):
    if user_id in USER_DATA_DB:
        return USER_DATA_DB[user_id]
    raise HTTPException(status_code=404, detail="사용자 데이터를 찾을 수 없습니다.")

@app.post("/update_user_data")
async def update_user_data(user_id: str, car: float, bus: float, walk: float):
    if user_id in USER_DATA_DB:
        USER_DATA_DB[user_id] = {"car": car, "bus": bus, "walk": walk}
        return {"message": f"✅ {user_id}의 이동 데이터가 업데이트되었습니다!", "updated_data": USER_DATA_DB[user_id]}
    raise HTTPException(status_code=404, detail="❌ 사용자 데이터를 찾을 수 없습니다.")

# ✅ 탄소 배출량 예측 API
@app.get("/predict")
async def predict(
    car: float = Query(..., title="Car Distance"),
    bus: float = Query(..., title="Bus Distance"),
    walk: float = Query(..., title="Walk Distance")
):
    try:
        logging.debug(f"🔥 [DEBUG] 입력 값: car={car}, bus={bus}, walk={walk}")
        if any(value < 0 for value in [car, bus, walk]):
            raise HTTPException(status_code=400, detail="🚨 모든 값은 0 이상이어야 합니다.")

        input_data = np.array([[car, bus, walk]], dtype=float)
        prediction = float(model.predict(input_data)[0])

        return {"predicted_emission": round(prediction, 2)}

    except Exception as e:
        logging.error(f"❌ [ERROR] 예측 중 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=f"서버 내부 오류 발생: {str(e)}")

# ✅ 추천 API
emission_factors = {
    "car": 180,
    "bus": 80,
    "walk": 0
}

@app.get("/recommend")
async def recommend_reduction(
    car: float = Query(0, title="Car Distance"),
    bus: float = Query(0, title="Bus Distance"),
    walk: float = Query(0, title="Walk Distance")
):
    recommendations = []

    if car > 10:
        reduction = 10 * emission_factors["car"]
        recommendations.append(f"🚗 자동차를 10km 줄이면 {reduction}g CO₂ 절감 가능!")
    if bus < 20:
        increase = 10 * emission_factors["bus"]
        recommendations.append(f"🚌 버스를 10km 추가 이용하면 {increase}g CO₂ 절감 가능!")
    if car > 3 and walk < 5:
        recommendations.append("🚶 도보 이동을 늘리면 탄소 배출 없이 건강도 챙길 수 있어요!")

    return {"recommendations": recommendations}

# ✅ 하루 탄소 저장 및 위치 데이터 삭제 API
@app.post("/save_daily_emission")
def save_daily_emission(data: DailyEmission):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO daily_emissions (user_id, emission, date)
        VALUES (?, ?, ?)
    """, (data.user_id, data.emission, str(date.today())))

    cur.execute("DELETE FROM locations WHERE user_id = ?", (data.user_id,))
    conn.commit()
    conn.close()
    print(f"✅ 탄소 배출량 저장 및 위치 기록 삭제 완료! | 사용자: {data.user_id}")
    return {"message": "✅ 탄소 배출량 저장 및 위치 기록 삭제 완료!"}

# ✅ 글로벌 예외 처리
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"🔥 [GLOBAL ERROR] FastAPI 글로벌 예외 발생: {str(exc)}")
    return HTTPException(status_code=500, detail="🚨 서버 내부 오류 발생")