# ✅ FastAPI main.py (OCR 인증 전용)
from fastapi import FastAPI, HTTPException, Query, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette.responses import JSONResponse
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
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
from datetime import datetime

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
        CREATE TABLE IF NOT EXISTS certifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            product_matched BOOLEAN,
            mark_matched BOOLEAN,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS daily_transport (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            date TEXT,
            walking_distance REAL DEFAULT 0,
            bus_distance REAL DEFAULT 0,
            car_distance REAL DEFAULT 0,
            UNIQUE(user_id, date)
        )
    """)
    conn.commit()
    conn.close()

initialize_db()

# ✅ 위치 저장 API
class LocationData(BaseModel):
    user_id: str
    latitude: float
    longitude: float
    speed: float

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

# ✅ OCR 바코드 추출 및 마크 검증 함수
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
        if target == code or target in code or code in target:
            return True
    return False

def check_mark_template(image_path, threshold=0.2):
    try:
        img = cv2.imread(image_path, 0)
        template = cv2.imread(TEMPLATE_MARK_PATH, 0)
        res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, _ = cv2.minMaxLoc(res)
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
            INSERT INTO certifications (user_id, product_matched, mark_matched)
            VALUES (?, ?, ?)
        """, (
            user_id,
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

# ✅ 일일 교통수단 거리 저장 API
class TransportData(BaseModel):
    user_id: str
    walking_distance: float = 0
    bus_distance: float = 0
    car_distance: float = 0
    
@app.post("/transport_summary")
def save_transport_summary(data: TransportData):
    today = datetime.now().strftime("%Y-%m-%d")
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # 먼저 해당 날짜의 기존 데이터가 있는지 확인
        cur.execute("""
            SELECT walking_distance, bus_distance, car_distance 
            FROM daily_transport 
            WHERE user_id = ? AND date = ?
        """, (data.user_id, today))
        
        result = cur.fetchone()
        
        if result:
            # 기존 데이터가 있으면 합산하여 업데이트
            walking_sum = result['walking_distance'] + data.walking_distance
            bus_sum = result['bus_distance'] + data.bus_distance
            car_sum = result['car_distance'] + data.car_distance
            
            cur.execute("""
                UPDATE daily_transport 
                SET walking_distance = ?, bus_distance = ?, car_distance = ? 
                WHERE user_id = ? AND date = ?
            """, (walking_sum, bus_sum, car_sum, data.user_id, today))
            
            message = "교통수단 거리 업데이트 완료"
        else:
            # 기존 데이터가 없으면 새로 삽입
            cur.execute("""
                INSERT INTO daily_transport (user_id, date, walking_distance, bus_distance, car_distance)
                VALUES (?, ?, ?, ?, ?)
            """, (data.user_id, today, data.walking_distance, data.bus_distance, data.car_distance))
            
            message = "교통수단 거리 신규 저장 완료"
        
        conn.commit()
        print(f"✅ {message} | 사용자: {data.user_id}, 날짜: {today}")
        
        # 합산된 최종 데이터를 응답으로 반환
        cur.execute("""
            SELECT walking_distance, bus_distance, car_distance 
            FROM daily_transport 
            WHERE user_id = ? AND date = ?
        """, (data.user_id, today))
        final_data = cur.fetchone()
        
        return {
            "message": message,
            "date": today,
            "walking_distance": final_data['walking_distance'],
            "bus_distance": final_data['bus_distance'],
            "car_distance": final_data['car_distance']
        }
        
    except Exception as e:
        conn.rollback()
        print(f"❌ 교통수단 거리 저장 오류: {e}")
        raise HTTPException(status_code=500, detail=f"데이터 저장 중 오류 발생: {str(e)}")
    finally:
        conn.close()

@app.get("/transport_summary/{user_id}")
def get_transport_summary(user_id: str, date: str = None):
    conn = get_db()
    cur = conn.cursor()
    
    try:
        # 날짜가 지정되지 않으면 오늘 날짜 사용
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        
        cur.execute("""
            SELECT date, walking_distance, bus_distance, car_distance 
            FROM daily_transport 
            WHERE user_id = ? AND date = ?
        """, (user_id, date))
        
        result = cur.fetchone()
        
        if result:
            return {
                "date": result['date'],
                "walking_distance": result['walking_distance'],
                "bus_distance": result['bus_distance'],
                "car_distance": result['car_distance']
            }
        else:
            return {
                "date": date,
                "walking_distance": 0,
                "bus_distance": 0,
                "car_distance": 0,
                "message": "해당 날짜의 데이터가 없습니다."
            }
    
    except Exception as e:
        print(f"❌ 교통수단 거리 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"데이터 조회 중 오류 발생: {str(e)}")
    finally:
        conn.close()

# ✅ 글로벌 예외
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"🔥 글로벌 예외 발생: {exc}")
    return HTTPException(status_code=500, detail="🚨 서버 오류")

##  uvicorn main:app --reload --host 0.0.0.0 --port 8001
