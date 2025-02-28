import pandas as pd

# CSV 데이터 불러오기
df = pd.read_csv("steps_data.csv")

# 📌 날짜 열을 제외한 숫자형 데이터만 선택해서 결측값 채우기
df.iloc[:, 1:] = df.iloc[:, 1:].fillna(df.iloc[:, 1:].mean())

# 데이터 정규화 (0~1 범위)
df["steps"] = (df["steps"] - df["steps"].min()) / (df["steps"].max() - df["steps"].min())
df["distance_km"] = (df["distance_km"] - df["distance_km"].min()) / (df["distance_km"].max() - df["distance_km"].min())
df["calories"] = (df["calories"] - df["calories"].min()) / (df["calories"].max() - df["calories"].min())

# 결과 확인
print("📌 정규화된 데이터:")
print(df)
