# 디스코드 업데이트 · 고정 글 (허스키 메이커)

> 문서 분류: **운영 도구 안내** · 2026-10-23. 도구는 husky-puzzle의 게시 도구를 이 저장소로 옮긴 것이다(게시 형식 v1 · 확인 코드 · 키체인 항목이 같다).
> 서버 전체 구성 · 공통 글 · 게임 더하기는 husky-puzzle의 `docs/discord-community.md` · `docs/discord-server.md` · `docs/discord-add-game.md`(서버 공통 일은 그쪽 도구가 맡는다).

## 이 저장소에서 할 수 있는 것

| 명령 | 하는 일 |
|---|---|
| `python3 tools/discord_updates.py status` | 아직 안 올린 커밋 수 |
| `python3 tools/discord_updates.py sync --dry-run` | 올릴 글 미리 보기 |
| `python3 tools/discord_updates.py sync` | `📜・메이커-업데이트`에 올리기(안 올린 커밋을 한 글로) |
| `python3 tools/discord_updates.py sync --notes <원고.md>` | 사람이 다듬은 원고로 올리기(원고가 안 올린 커밋 **전부**를 설명해야 한다) |
| `python3 tools/discord_updates.py play --dry-run` · `play` | `🎮・메이커-플레이` 고정 글을 [discord-play.md](discord-play.md)대로 고치기(같은 글을 고친다) |
| `python3 tools/discord_updates.py install` | 커밋 · 푸시 때 저절로 `sync`하는 훅 걸기(`.githooks/`). `--store-token`은 키체인에 봇 토큰을 새로 넣을 때만 |

- 봇 토큰은 맥 키체인(`hucodi.husky.discord-updates`)에만 있다. **이 저장소는 공개라 토큰 · 서버 주소를 절대 적지 않는다.** 다른 운영체제는 `DISCORD_BOT_TOKEN` 환경변수. 클라우드 세션은 디스코드에 쓰지 못한다.
- 채널 ID는 [`tools/discord-updates.json`](../tools/discord-updates.json). 채널 이름은 바뀌어도 ID로 찾는다.
- 이번 커밋을 올리지 않으려면 `HUSKY_DISCORD_DEFER=1 git commit …`(훅이 쉰다). 그 뒤 다음 `sync`에 섞이지 않게 하려면 `.local/discord-updates/state.json`의 `covered`에 그 커밋을 넣는다.

## 게시 형식 v1
- 제목 `허스키 메이커 · 개발 업데이트 · YYYY-MM-DD`(날짜는 마지막 커밋의 한국 시간), 본문은 `**추가**` → `**개선**` → `**수정**` → `**안내**` 구역과 `- 한 문장`. 빈 구역 · 같은 문장은 뺀다. 표 · 중첩 목록 · 코드 블록 · 인사말은 넣지 않는다.
- 커밋 메시지에 `Discord-Note: [추가|개선|수정|안내] 한 문장`을 적으면 그 문장을 쓴다. 없으면 커밋 제목을 쓰고(오류 수정은 `수정`, 그 밖은 `개선`), 문서 · 도구만 바뀐 커밋은 `[안내] 개발 문서와 작업 도구를 정리했습니다.`가 된다. 그러니 **사용자가 볼 변경에는 `Discord-Note`를 꼭 쓴다**(영어 커밋 제목이 그대로 올라가지 않게).
- 글 밑의 확인 코드(`husky-v1:…`)는 누락 · 중복을 막는 데 쓴다. 손대지 않는다.

## 누락 · 중복
- 다 올라간 뒤에만 그 커밋들을 게시됨으로 적는다(`.local/discord-updates/state.json`, git에 올리지 않음). 일부만 올라가면 다음에 이어 보낸다.
- 기록 파일이 없어져도 업데이트 채널에서 봇이 쓴 확인 코드를 읽어 되살린다.
- husky-puzzle 도구의 `--repo ../HUSKY-GAME`도 **같은 기록 파일**(이 저장소의 `.local/`)을 쓰므로 어느 쪽에서 돌려도 두 번 올라가지 않는다.

## 검사
```sh
python3 -m unittest discover -s tools/tests -p 'test_discord_updates.py' -v
```
가짜 디스코드와 임시 저장소로 돈다. 실서버에 시험 글을 올리지 않는다.
