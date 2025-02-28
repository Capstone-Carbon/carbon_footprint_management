import requests

url = "http://127.0.0.1:8000/predict/"
data = {
    "steps": 8000,
    "distance_km": 5.2,
    "calories": 280
}

try:
    response = requests.post(url, json=data)
    print(f"📌 응답 코드: {response.status_code}")  # HTTP 응답 코드 확인
    print("📌 응답 데이터:", response.json())  # 응답 본문 출력
except requests.exceptions.RequestException as e:
    print(f"🚨 요청 실패: {e}")