const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const getDrivingDistance = async (origin, destination) => {
  const url =
    'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';

  const requestBody = {
    origins: [
      {
        waypoint: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng,
            },
          },
        },
      },
    ],
    destinations: [
      {
        waypoint: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng,
            },
          },
        },
      },
    ],
    travelMode: 'DRIVE',
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask':
          'originIndex,destinationIndex,duration,distanceMeters,status',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.length > 0 && data[0].status === 'OK') {
      const distanceInMeters = data[0].distanceMeters; // 미터 단위 거리
      return distanceInMeters / 1000; // km 변환
    } else {
      console.error('Routes API 오류:', data);
      return 0;
    }
  } catch (error) {
    console.error('API 호출 실패:', error);
    return 0;
  }
};

// 테스트 실행 (위도/경도 좌표로 테스트)
getDrivingDistance(
  { lat: 37.5665, lng: 126.978 },
  { lat: 37.4979, lng: 127.0276 }
).then((distance) => {
  console.log('자동차 이동 거리 (km):', distance);
});
