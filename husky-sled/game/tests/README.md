# 자동 물리 테스트

화면 없이(headless) 허스키 4마리를 스크립트로 움직여서 결과를 숫자로 확인합니다.
물리 코드나 맵을 고친 뒤에 돌려서, 예전에 되던 것이 깨지지 않았는지 확인하는 용도입니다.

```
cd husky-sled/game
godot --headless --path . --fixed-fps 120 -s tests/physics_test.gd             # 물리 테스트 맵 전체 시나리오
godot --headless --path . --fixed-fps 120 -s tests/physics_test.gd -- brake    # 휠견 멈추기만
godot --headless --path . --fixed-fps 120 -s tests/lane_test.gd -- script      # 세 갈래 길
```

`--fixed-fps 120`은 필수입니다. 프로젝트 물리 속도(120Hz)와 같아야 1프레임이 1물리 스텝이 됩니다.

## physics_test.gd (물리 테스트 맵)
| 시나리오 | 기대 결과 (Godot 4.7.2) |
|---|---|
| all4_forward | 썰매 약 13.6m, 화물 6/6 |
| 3fwd_1idle | 가만히 있던 허스키가 약 10m 끌려옴 |
| all4_sprint | 약 17.5m, 화물 4/6 (급출발) |
| hang_then_rescue | 매달렸다가 땅 위로 올라옴 |
| knockdown | 앞쪽 허스키가 넘어짐 |
| glide_no_brake / glide_wheels_back | 휠견이 뒤로 버티면 미끄러진 거리가 약 13.0m → 11.4m |

## lane_test.gd (1-4 세 갈래 길)
`-- 모드`로 고릅니다.

| 모드 | 하는 일 | 기대 결과 |
|---|---|---|
| idle | 가만히 있기 | 3초 동안 썰매가 움직이지 않음 |
| naive | 네 마리가 앞으로만 걷기 | 입구 막에 걸려서 **전진 못 함** (STUCK) |
| script | 양쪽 길로 갈라져서 구멍 앞에서 같이 달리고 점프 | DELIVERED 6/6, 약 23초 |
| split | 오른쪽 팀만 달리기를 안 함 | DELIVERED (6/6 또는 5/6) |
| walk | 아무도 달리지 않음 | DELIVERED 5/6 (화물을 잃음) |

결과 줄은 `RESULT [모드]: ...`로 나옵니다.
