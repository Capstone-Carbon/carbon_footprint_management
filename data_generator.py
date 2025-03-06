import pandas as pd
import numpy as np
import os

# 저장할 경로 설정
save_path = "C:/Projects/carbon_footprint_management/data"  # Windows 경로

# 경로가 없으면 폴더 생성
if not os.path.exists(save_path):
    os.makedirs(save_path)

# 가상의 이동 데이터 생성
data = {
    "car_distance": np.random.randint(0, 50, 100),   # 자가용 이동 거리 (km)
    "bus_distance": np.random.randint(0, 50, 100),   # 대중교통 이동 거리 (km)
    "bike_distance": np.random.randint(0, 20, 100),  # 자전거 이동 거리 (km)
    "walk_distance": np.random.randint(0, 10, 100),  # 도보 이동 거리 (km)
    "train_distance": np.random.randint(0, 50, 100), # 기차 이동 거리 (km)
}

df = pd.DataFrame(data)

# 탄소 배출량 계산
df["carbon_emission"] = (
    df["car_distance"] * 180 +   
    df["bus_distance"] * 80 +    
    df["train_distance"] * 40    
)  

# CSV 파일로 저장
file_path = os.path.join(save_path, "carbon_emission_data.csv")
df.to_csv(file_path, index=False)

print(f"✅ 데이터셋 저장 완료: {file_path}")