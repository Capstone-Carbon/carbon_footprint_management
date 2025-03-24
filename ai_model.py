import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.ensemble import RandomForestRegressor
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam

# ✅ 데이터 파일 경로 수정 (Windows에서도 정상 작동)
data_path = os.path.join(os.getcwd(), "data", "carbon_emission_data_fixed.csv")

# ✅ 데이터 로드 (자가용, 대중교통, 도보만 포함)
df = pd.read_csv(data_path)

# ✅ 필요 없는 컬럼 삭제
df = df[["car_distance", "bus_distance", "walk_distance", "carbon_emission"]]

# ✅ 입력(features)과 출력(target) 설정
X = df[["car_distance", "bus_distance", "walk_distance"]]
y = df["carbon_emission"]

# ✅ 데이터셋 분할 (Train: 80%, Test: 20%)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ✅ 랜덤 포레스트 모델 학습
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)

# ✅ 신경망 모델(MLP) 학습
mlp_model = Sequential([
    Dense(64, activation="relu", input_shape=(X_train.shape[1],)),
    Dense(32, activation="relu"),
    Dense(1)
])

# ✅ 손실 함수 최신 방식으로 변경
mlp_model.compile(optimizer=Adam(learning_rate=0.01), 
                  loss=tf.keras.losses.MeanSquaredError(), 
                  metrics=["mae"])

mlp_model.fit(X_train, y_train, epochs=100, batch_size=16, verbose=0)

# ✅ 모델 비교
y_pred_rf = rf_model.predict(X_test)
y_pred_mlp = mlp_model.predict(X_test).flatten()

mae_rf = mean_absolute_error(y_test, y_pred_rf)
mae_mlp = mean_absolute_error(y_test, y_pred_mlp)

# ✅ 최적 모델 선택 (MAE가 낮은 모델 선택)
if mae_rf < mae_mlp:
    best_model = rf_model
    model_name = "Random Forest"
    model_path = os.path.join(os.getcwd(), "data", "best_carbon_model.pkl")

    # ✅ 랜덤 포레스트 모델 저장 (pickle 사용)
    with open(model_path, "wb") as file:
        pickle.dump(best_model, file)

else:
    best_model = mlp_model
    model_name = "Neural Network (MLP)"
    model_path = os.path.join(os.getcwd(), "data", "best_carbon_model.keras")  # ✅ 최신 Keras 저장 형식 사용

    # ✅ 신경망 모델 저장 (TensorFlow 최신 방식)
    best_model.save(model_path)

print(f"\n💾 최적 모델({model_name}) 저장 완료! -> {model_path}")
