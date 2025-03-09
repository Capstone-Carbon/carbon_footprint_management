import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam

# ✅ 1. 데이터 불러오기
file_path = os.path.join(os.path.dirname(__file__), "data", "carbon_emission_data.csv")
df = pd.read_csv(file_path)

# 입력(features)과 출력(target) 설정
X = df[["car_distance", "bus_distance", "bike_distance", "walk_distance", "train_distance"]]  # 이동 거리
y = df["carbon_emission"]  # 탄소 배출량

# ✅ 2. 데이터셋 분할 (Train: 80%, Test: 20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ 3. 모델 학습 및 평가 함수
def evaluate_model(model, model_name):
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    
    print(f"\n🔥 {model_name} 성능 평가:")
    print(f"📉 MAE: {mae:.2f}")
    print(f"📉 MSE: {mse:.2f}")
    print(f"📉 RMSE: {rmse:.2f}")

    return model, mae, mse, rmse

# ✅ 4. 선형 회귀 모델 (Baseline)
linear_model = LinearRegression()
linear_model, mae_lr, mse_lr, rmse_lr = evaluate_model(linear_model, "선형 회귀 (Linear Regression)")

# ✅ 5. 랜덤 포레스트 (RandomForest)
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model, mae_rf, mse_rf, rmse_rf = evaluate_model(rf_model, "랜덤 포레스트 (Random Forest)")

# ✅ 6. XGBoost 모델
xgb_model = XGBRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
xgb_model, mae_xgb, mse_xgb, rmse_xgb = evaluate_model(xgb_model, "XGBoost")

# ✅ 7. 신경망 (MLP Neural Network)
mlp_model = Sequential([
    Dense(64, activation="relu", input_shape=(X_train.shape[1],)),
    Dense(32, activation="relu"),
    Dense(1)  # 출력층 (탄소 배출량 예측)
])
mlp_model.compile(optimizer=Adam(learning_rate=0.01), loss="mse", metrics=["mae"])
mlp_model.fit(X_train, y_train, epochs=100, batch_size=16, verbose=0)

# 신경망 예측 및 평가
y_pred_mlp = mlp_model.predict(X_test).flatten()
mae_mlp = mean_absolute_error(y_test, y_pred_mlp)
mse_mlp = mean_squared_error(y_test, y_pred_mlp)
rmse_mlp = np.sqrt(mse_mlp)

print(f"\n🔥 신경망 (MLP) 성능 평가:")
print(f"📉 MAE: {mae_mlp:.2f}")
print(f"📉 MSE: {mse_mlp:.2f}")
print(f"📉 RMSE: {rmse_mlp:.2f}")

# ✅ 8. 모델 비교 및 최적 모델 선택
results = {
    "Model": ["Linear Regression", "Random Forest", "XGBoost", "Neural Network (MLP)"],
    "MAE": [mae_lr, mae_rf, mae_xgb, mae_mlp],
    "MSE": [mse_lr, mse_rf, mse_xgb, mse_mlp],
    "RMSE": [rmse_lr, rmse_rf, rmse_xgb, rmse_mlp]
}

df_results = pd.DataFrame(results)
df_results = df_results.sort_values(by="RMSE", ascending=True)  # RMSE가 낮을수록 좋음

# ✅ RMSE가 비정상적으로 낮은 경우(예: 0)는 제외
df_results_filtered = df_results[df_results["RMSE"] > 1e-6]

if not df_results_filtered.empty:
    best_model_name = df_results_filtered.iloc[0]["Model"]
else:
    best_model_name = df_results.iloc[0]["Model"]  # 만약 필터링 후 비어 있으면 기존 방식 유지

print("\n🚀 최적 모델 비교 결과:")
print(df_results)

# ✅ 9. 최적 모델 저장
if best_model_name == "Linear Regression":
    best_model = linear_model
elif best_model_name == "Random Forest":
    best_model = rf_model
elif best_model_name == "XGBoost":
    best_model = xgb_model
else:
    best_model = mlp_model

# 모델 저장
model_path = os.path.join(os.path.dirname(__file__), "data", "best_carbon_model.pkl")
with open(model_path, "wb") as file:
    pickle.dump(best_model, file)

print(f"\n💾 최적 모델({best_model_name}) 저장 완료! -> {model_path}")

# ✅ main.py에서 최적 모델 사용하도록 경로 변경
MODEL_PATH = os.path.join(os.path.dirname(__file__), "data", "best_carbon_model.pkl")
