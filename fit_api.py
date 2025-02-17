import json
import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build


# Google Fit API 인증 정보 로드
SCOPES = ["https://www.googleapis.com/auth/fitness.activity.read"]
CREDENTIALS_FILE = "C:/Users/ghkll/OneDrive/바탕 화면/carbon_footprint_management/credentials.json"




# Google API 연결
credentials = service_account.Credentials.from_service_account_file(
    CREDENTIALS_FILE,
    scopes=["https://www.googleapis.com/auth/fitness.activity.read"]
)


service = build("fitness", "v1", credentials=credentials)

# 오늘 날짜 기준으로 데이터 가져오기
def get_steps():
    # today = datetime.datetime.utcnow().isoformat() + "Z"  # ISO 형식
    # dataset = f"{int(datetime.datetime.timestamp(datetime.datetime.utcnow()))}000000000"

    # request = service.users().dataset().aggregate(userId="me", body={
    #     "aggregateBy": [{"dataTypeName": "com.google.step_count.delta"}],
    #     "bucketByTime": {"durationMillis": 86400000},  # 하루(24시간) 단위
    #     "startTimeMillis": int(datetime.datetime.timestamp(datetime.datetime.utcnow()) * 1000) - 86400000,
    #     "endTimeMillis": int(datetime.datetime.timestamp(datetime.datetime.utcnow()) * 1000),
    # })

    # response = request.execute()
    
    # # 응답 데이터 출력
    # steps = response.get("bucket", [])[0].get("dataset", [])[0].get("point", [])[0].get("value", [{}])[0].get("intVal", 0)
    # print(f"오늘 걸음 수: {steps}")
    # 🛠️ 테스트용 데이터 (Google Fit API 대신 사용)
    response = {
        "bucket": [{
            "dataset": [{
                "point": [{
                    "value": [{"intVal": 5000}]  # 💡 테스트용 걸음 수 (5000 걸음)
                }]
            }]
        }]
    }
    
    # 🚀 테스트 데이터에서 걸음 수 추출
    steps = response["bucket"][0]["dataset"][0]["point"][0]["value"][0]["intVal"]
    print(f"🚀 테스트용 걸음 수: {steps}")

# 실행
if __name__ == "__main__":
    get_steps()