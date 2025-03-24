# from fastapi import FastAPI, HTTPException, Query
# import pickle
# import numpy as np
# import os
# import logging
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware

# app = FastAPI()

# # ✅ CORS 설정 수정 (React에서 FastAPI 요청 가능하게 설정)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 모든 프론트엔드에서 API 요청 허용
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ✅ FastAPI 오류 로그 활성화
# logging.basicConfig(level=logging.DEBUG)

# # ✅ 모델 파일 경로 (최적 모델 사용하도록 변경)
# MODEL_PATH = os.path.join(os.path.dirname(__file__), "data", "best_carbon_model.pkl")

# # ✅ AI 모델 로드
# try:
#     with open(MODEL_PATH, "rb") as file:
#         model = pickle.load(file)
#     print("✅ 모델 로드 성공!")
# except Exception as e:
#     print(f"❌ 모델 로드 실패: {e}")

# # ✅ Pydantic 모델 사용 (입력 데이터 유효성 검증)
# class CarbonFootprintRequest(BaseModel):
#     car: float
#     bus: float
#     bike: float
#     walk: float
#     train: float

# # ✅ 사용자 이동 데이터 샘플 (실제 데이터베이스 연동 필요)
# USER_DATA_DB = {
#     "user1": {"car": 20, "bus": 15, "bike": 8, "walk": 4, "train": 12},
#     "user2": {"car": 10, "bus": 20, "bike": 5, "walk": 10, "train": 5},
# }

# @app.get("/user_data")
# async def get_user_data(user_id: str):
#     if user_id in USER_DATA_DB:
#         return USER_DATA_DB[user_id]
#     raise HTTPException(status_code=404, detail="사용자 데이터를 찾을 수 없습니다.")

# @app.post("/update_user_data")
# async def update_user_data(user_id: str, car: float, bus: float, bike: float, walk: float, train: float):
#     if user_id in USER_DATA_DB:
#         USER_DATA_DB[user_id] = {"car": car, "bus": bus, "bike": bike, "walk": walk, "train": train}
#         return {"message": f"✅ {user_id}의 이동 데이터가 업데이트되었습니다!", "updated_data": USER_DATA_DB[user_id]}
#     raise HTTPException(status_code=404, detail="❌ 사용자 데이터를 찾을 수 없습니다.")

# @app.get("/predict")
# async def predict(
#     car: float = Query(..., title="Car Distance", description="Car distance in km"),
#     bus: float = Query(..., title="Bus Distance", description="Bus distance in km"),
#     bike: float = Query(..., title="Bike Distance", description="Bike distance in km"),
#     walk: float = Query(..., title="Walk Distance", description="Walk distance in km"),
#     train: float = Query(..., title="Train Distance", description="Train distance in km")
# ):
#     try:
#         logging.debug(f"🔥 [DEBUG] 입력 값: car={car}, bus={bus}, bike={bike}, walk={walk}, train={train}")
#         if any(value < 0 for value in [car, bus, bike, walk, train]):
#             raise HTTPException(status_code=400, detail="🚨 모든 값은 0 이상이어야 합니다.")

#         input_data = np.array([[car, bus, bike, walk, train]], dtype=float)
#         logging.debug(f"🔥 [DEBUG] 변환된 입력 데이터: {input_data}")

#         prediction = float(model.predict(input_data)[0])
#         logging.debug(f"🔥 [DEBUG] 예측 결과: {prediction}")

#         return {"predicted_emission": round(prediction, 2)}

#     except Exception as e:
#         logging.error(f"❌ [ERROR] 예측 중 오류 발생: {e}")  
#         raise HTTPException(status_code=500, detail=f"서버 내부 오류 발생: {str(e)}")

# emission_factors = {
#     "car": 180,
#     "bus": 80,
#     "bike": 0,
#     "walk": 0,
#     "train": 40
# }

# @app.get("/recommend")
# async def recommend_reduction(
#     car: float = Query(0, title="Car Distance"),
#     bus: float = Query(0, title="Bus Distance"),
#     bike: float = Query(0, title="Bike Distance"),
#     walk: float = Query(0, title="Walk Distance"),
#     train: float = Query(0, title="Train Distance")
# ):
#     recommendations = []

#     if car > 10:
#         reduction = 10 * emission_factors["car"]
#         recommendations.append(f"🚗 자동차를 10km 줄이면 {reduction}g CO₂ 절감 가능!")
#     if bus < 20:
#         increase = 10 * emission_factors["bus"]
#         recommendations.append(f"🚌 버스를 10km 추가 이용하면 {increase}g CO₂ 절감 가능!")
#     if car > 5 and bike < 10:
#         recommendations.append("🚴‍♂️ 자전거를 이용하면 탄소 배출 없이 이동 가능!")
#     if car > 3 and walk < 5:
#         recommendations.append("🚶 도보 이동을 늘리면 탄소 배출 없이 건강도 챙길 수 있어요!")

#     return {"recommendations": recommendations}

# @app.exception_handler(Exception)
# async def global_exception_handler(request, exc):
#     logging.error(f"🔥 [GLOBAL ERROR] FastAPI 글로벌 예외 발생: {str(exc)}")
#     return HTTPException(status_code=500, detail="🚨 서버 내부 오류 발생")
