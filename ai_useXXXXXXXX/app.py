# from fastapi import FastAPI
# from pydantic import BaseModel
# import pandas as pd
# import numpy as np
# from sklearn.preprocessing import StandardScaler
# from sklearn.neighbors import KNeighborsRegressor
# from xgboost import XGBRegressor
# import uvicorn

# # FastAPI 앱 생성
# app = FastAPI()

# # 입력 데이터 모델 정의
# class UserData(BaseModel):
#     car_distance: float
#     bus_distance: float
#     bike_distance: float
#     walk_distance: float
#     train_distance: float

# # 샘플 데이터 (훈련용)
# data = pd.DataFrame([
#     [49, 9, 12, 9, 49, 11500],
#     [6, 26, 9, 3, 17, 3840],
#     [4, 49, 6, 4, 43, 6360],
#     [22, 32, 4, 2, 3, 6640],
#     [5, 27, 4, 3, 30, 4260],
#     [45, 23, 5, 4, 30, 11140],
#     [29, 22, 2, 6, 39, 8540],
#     [15, 3, 4, 3, 29, 4100],
#     [16, 7, 11, 2, 10, 3840],
#     [36, 27, 10, 8, 34, 10000],
# ], columns=['car_distance', 'bus_distance', 'bike_distance', 'walk_distance', 'train_distance', 'carbon_emission'])

# # 데이터 정규화 (표준화)
# scaler = StandardScaler()
# scaled_features = scaler.fit_transform(data.drop(columns=['carbon_emission']))
# normalized_data = pd.DataFrame(scaled_features, columns=['car_distance', 'bus_distance', 'bike_distance', 'walk_distance', 'train_distance'])
# normalized_data['carbon_emission'] = data['carbon_emission']

# # 데이터 분리
# X = normalized_data.drop(columns=['carbon_emission'])
# y = normalized_data['carbon_emission']

# # XGBoost 모델 학습
# xgb_model = XGBRegressor(n_estimators=50, learning_rate=0.1, max_depth=3, random_state=42)
# xgb_model.fit(X, y)

# # KNN 모델 학습
# knn_model = KNeighborsRegressor(n_neighbors=3)
# knn_model.fit(X, y)

# # API 엔드포인트 (탄소 배출량 예측 및 절감 목표 추천)
# @app.post("/predict_carbon_emission/")
# async def predict_carbon_emission(user_data: UserData):
#     # 입력 데이터를 DataFrame으로 변환
#     user_input = pd.DataFrame([[user_data.car_distance, user_data.bus_distance, user_data.bike_distance,
#                                 user_data.walk_distance, user_data.train_distance]],
#                               columns=['car_distance', 'bus_distance', 'bike_distance', 'walk_distance', 'train_distance'])

#     # 데이터 정규화 적용
#     user_input_normalized = scaler.transform(user_input)

#     # XGBoost 모델을 이용한 탄소 배출량 예측 (float 변환 추가)
#     predicted_emission = float(xgb_model.predict(user_input_normalized)[0])

#     # KNN을 이용한 맞춤형 탄소 절감 목표 추천 (float 변환 추가)
#     similar_users = knn_model.kneighbors(user_input_normalized, n_neighbors=3, return_distance=False)
#     recommended_reduction = float(np.mean(y.iloc[similar_users[0]]))

#     # 결과 반환
#     return {
#         "Predicted Carbon Emission (g)": predicted_emission,
#         "Recommended Carbon Reduction Target (g)": recommended_reduction
#     }

# # FastAPI 실행 (로컬 서버)
# if __name__ == "__main__":
#     uvicorn.run(app, host="127.0.0.1", port=8000)
