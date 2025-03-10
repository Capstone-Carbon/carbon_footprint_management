import pandas as pd
import numpy as np
import os

# ✅ 저장할 경로 설정
save_path = os.path.join(os.path.dirname(__file__), "data")

# ✅ 경로가 없으면 폴더 생성
if not os.path.exists(save_path):
    os.makedirs(save_path)

# ✅ 데이터 개수 설정 (훈련 데이터 확대)
num_samples = 1000  # 기존 100 → 1000개로 데이터 수 증가

# ✅ 현실적인 이동 패턴 반영
def generate_realistic_distances():
    # 🚗 자동차 이용 거리 (출퇴근 많은 경우, 랜덤으로 많아질 확률 높음)
    car_distance = np.random.choice(
        [np.random.randint(0, 10), np.random.randint(20, 50)], 
        p=[0.7, 0.3]  # 70%는 짧은 거리, 30%는 긴 거리
    )

    # 🚌 대중교통 이용 거리 (대중교통 중심 생활 vs 짧은 거리)
    bus_distance = np.random.choice(
        [np.random.randint(0, 20), np.random.randint(30, 50)], 
        p=[0.6, 0.4]
    )

    # 🚴‍♂️ 자전거 이용 거리 (대부분 짧은 거리)
    bike_distance = np.random.randint(0, 15) 

    # 🚶 도보 이동 거리 (일반적으로 짧음)
    walk_distance = np.random.randint(0, 8)

    # 🚆 기차 이용 거리 (장거리 이동, 하지만 확률 낮음)
    train_distance = np.random.choice(
        [np.random.randint(0, 20), np.random.randint(50, 100)], 
        p=[0.8, 0.2]
    )

    return car_distance, bus_distance, bike_distance, walk_distance, train_distance

# ✅ 가상 이동 데이터 생성
data = {
    "car_distance": [],
    "bus_distance": [],
    "bike_distance": [],
    "walk_distance": [],
    "train_distance": [],
}

for _ in range(num_samples):
    car, bus, bike, walk, train = generate_realistic_distances()
    data["car_distance"].append(car)
    data["bus_distance"].append(bus)
    data["bike_distance"].append(bike)
    data["walk_distance"].append(walk)
    data["train_distance"].append(train)

df = pd.DataFrame(data)

# ✅ 탄소 배출량 계산 (새로운 가중치 반영)
emission_factors = {
    "car": 180,  # g CO₂ per km
    "bus": 80,
    "bike": 0,
    "walk": 0,
    "train": 40
}

df["carbon_emission"] = (
    df["car_distance"] * emission_factors["car"] +
    df["bus_distance"] * emission_factors["bus"] +
    df["train_distance"] * emission_factors["train"]
)

# ✅ CSV 파일로 저장
file_path = os.path.join(save_path, "carbon_emission_data.csv")
df.to_csv(file_path, index=False)

print(f"✅ 데이터셋 저장 완료! (총 {num_samples}개 샘플) -> {file_path}")
