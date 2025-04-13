# ✅ FastAPI main.py (탄소 저장 + OCR 인증 기능 + DB 저장 통합 최종 버전)
from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.responses import JSONResponse
import pickle
import numpy as np
import sqlite3
import os
import logging
import shutil
import uuid
import cv2
import re
from pyzbar.pyzbar import decode
from PIL import Image as PILImage
import pytesseract
from datetime import datetime, date

app = FastAPI()

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
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "carbon_model.pkl")
try:
    with open(MODEL_PATH, "rb") as file:
        model = pickle.load(file)
    print("✅ 모델 로드 성공!")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")

# ✅ SQLite 연결
DB_PATH = "./user_datas.db"
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ✅ DB 초기화
def initialize_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS locations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            latitude REAL,
            longitude REAL,
            speed REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS daily_emissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            emission REAL,
            date TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            product_matched BOOLEAN,
            mark_matched BOOLEAN,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

initialize_db()

# ✅ 데이터 모델
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
    user_id: str
    emission: float

# ✅ 위치 저장 API
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
    print(f"✅ 위치 저장 | 사용자: {loc.user_id}, 속도: {loc.speed:.2f} km/h")
    return {"message": "위치 및 속도 저장 완료!"}

# ✅ 예측 API
@app.get("/predict")
async def predict(
    car: float = Query(...),
    bus: float = Query(...),
    walk: float = Query(...)
):
    try:
        input_data = np.array([[car, bus, walk]], dtype=float)
        prediction = float(model.predict(input_data)[0])
        return {"predicted_emission": round(prediction, 2)}
    except Exception as e:
        logging.error(f"❌ 예측 오류: {e}")
        raise HTTPException(status_code=500, detail="서버 오류")

# ✅ 추천 API
emission_factors = {"car": 180, "bus": 80, "walk": 0}

@app.get("/recommend")
async def recommend(car: float = 0, bus: float = 0, walk: float = 0):
    result = []
    if car > 10:
        result.append("🚗 자동차를 10km 줄이면 1800g CO₂ 절감!")
    if bus < 20:
        result.append("🚌 버스를 10km 늘리면 800g CO₂ 절감!")
    if car > 3 and walk < 5:
        result.append("🚶 도보 이동을 늘리면 탄소 배출 없이 건강도 챙겨요!")
    return {"recommendations": result}

# ✅ 하루 탄소 저장 및 위치 삭제
@app.post("/save_daily_emission")
def save_emission(data: DailyEmission):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO daily_emissions (user_id, emission, date)
        VALUES (?, ?, ?)
    """, (data.user_id, data.emission, str(date.today())))
    cur.execute("DELETE FROM locations WHERE user_id = ?", (data.user_id,))
    conn.commit()
    conn.close()
    return {"message": "✅ 탄소 저장 및 위치 삭제 완료!"}


# ✅ OCR 바코드 추출 함수 (with 전처리)
BARCODE_REGEX = r"\b[0-9]{13}\b"
TEMPLATE_MARK_PATH = os.path.join(os.path.dirname(__file__), "template_mark.png")

def preprocess_for_receipt_barcode(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    enlarged = cv2.resize(gray, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_LINEAR)
    _, thresh = cv2.threshold(enlarged, 150, 255, cv2.THRESH_BINARY)
    return thresh

def read_barcode_with_pyzbar(image_path, preprocess=False):
    try:
        if preprocess:
            image = preprocess_for_receipt_barcode(image_path)
            decoded = decode(image)
        else:
            decoded = decode(PILImage.open(image_path))
        results = [obj.data.decode('utf-8') for obj in decoded if len(obj.data.decode('utf-8')) == 13]
        print("📦 [pyzbar] 바코드:", results)
        return results
    except Exception as e:
        print("❌ pyzbar 에러:", e)
        return []

def read_barcode_with_ocr(image_path, preprocess=False):
    try:
        img = cv2.imread(image_path)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        if preprocess:
            gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_LINEAR)
            gray = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        text = pytesseract.image_to_string(gray, config="--psm 6 -c tessedit_char_whitelist=0123456789", lang="eng")
        print("🧾 [OCR] 텍스트:", text)
        found = re.findall(BARCODE_REGEX, text)
        print("🔍 [OCR] 바코드:", found)
        return found
    except Exception as e:
        print("❌ OCR 에러:", e)
        return []

def extract_barcodes_all_methods(image_path, preprocess=False):
    pyzbar_codes = read_barcode_with_pyzbar(image_path, preprocess)
    ocr_codes = read_barcode_with_ocr(image_path, preprocess)
    return list(set(pyzbar_codes + ocr_codes))

def is_similar_barcode(target, candidates):
    for code in candidates:
        if target == code:
            return True
        if target in code or code in target:
            return True
    return False

def check_mark_template(image_path, threshold=0.2):
    try:
        img = cv2.imread(image_path, 0)
        template = cv2.imread(TEMPLATE_MARK_PATH, 0)
        res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
        min_val, max_val, _, _ = cv2.minMaxLoc(res)
        print(f"📐 마크 템플릿 유사도 점수: {max_val}")
        return max_val >= threshold
    except Exception as e:
        print(f"❌ 템플릿 비교 실패: {e}")
        return False
    
@app.post("/verify_receipt")
async def verify_receipt(
    user_id: str = Query(...),
    receipt_img: UploadFile = File(...),
    mark_img: UploadFile = File(...)
):
    try:
        receipt_path = f"temp_receipt_{uuid.uuid4().hex}.jpg"
        mark_path = f"temp_mark_{uuid.uuid4().hex}.jpg"

        with open(receipt_path, "wb") as r:
            shutil.copyfileobj(receipt_img.file, r)
        with open(mark_path, "wb") as m:
            shutil.copyfileobj(mark_img.file, m)

        barcode1_list = extract_barcodes_all_methods(mark_path, preprocess=True)
        barcode2_list = extract_barcodes_all_methods(receipt_path, preprocess=True)

        barcode1 = barcode1_list[0] if barcode1_list else None
        matched = is_similar_barcode(barcode1, barcode2_list) if barcode1 else False

        mark_valid = check_mark_template(mark_path)

        print("📦 마크 바코드:", barcode1)
        print("🧾 영수증 바코드 목록:", barcode2_list)
        print("✅ 최종 바코드 일치 여부:", matched)
        print("🎯 마크 이미지 유효 여부:", mark_valid)

        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO certifications (user_id, barcode1, barcode2, matched, mark_valid)
            VALUES (?, ?, ?, ?, ?)
        """, (
            user_id,
            barcode1,
            ','.join(barcode2_list),
            matched,
            mark_valid
        ))
        conn.commit()
        conn.close()

        os.remove(receipt_path)
        os.remove(mark_path)

        return JSONResponse(content={
            "valid": matched and mark_valid,
            "barcode_from_mark": barcode1,
            "barcode_from_receipt": barcode2_list,
            "matched": matched,
            "mark_valid": mark_valid
        })

    except Exception as e:
        logging.error(f"❌ 인증 실패: {e}")
        return JSONResponse(status_code=500, content={"error": "OCR 처리 실패", "detail": str(e)})


# ✅ 글로벌 예외
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"🔥 글로벌 예외 발생: {exc}")
    return HTTPException(status_code=500, detail="🚨 서버 오류")
