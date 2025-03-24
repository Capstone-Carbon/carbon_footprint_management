# import os
# import pandas as pd

# # ✅ 절대경로 설정
# base_dir = os.path.dirname(os.path.abspath(__file__))  # 현재 스크립트의 위치
# file_path = os.path.join(base_dir, "data", "carbon_emission_data.csv")  # 원본 데이터 경로

# # ✅ 데이터 로드
# df = pd.read_csv(file_path)

# # ✅ 필요 없는 컬럼 삭제
# df = df.drop(columns=["bike_distance", "train_distance"])

# # ✅ 수정된 데이터 저장 (새 파일로 저장)
# new_file_path = os.path.join(base_dir, "data", "carbon_emission_data_fixed.csv")
# df.to_csv(new_file_path, index=False)

# print(f"✅ 불필요한 컬럼 제거 완료! -> {new_file_path}")
