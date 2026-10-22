# 허스키 메이커 — 작업 규칙

> 이 파일은 이 저장소에서 일하는 모든 AI 도구(Claude Code · Codex · Antigravity)가 함께 읽는 규칙이다. Codex와 Antigravity는 `AGENTS.md`를 직접 읽고, Claude Code는 `CLAUDE.md`가 이 파일을 불러온다. 규칙은 여기에만 적는다.
> 자매 저장소 `dlawodnjs/husky-puzzle`(허스키 구출 퍼즐)의 같은 규칙을 2026-10-22에 옮겨 왔다. 두 저장소의 협업 규칙을 고칠 때는 양쪽을 함께 맞춘다.

## 여러 AI 도구가 함께 일하기
- **시작할 때** [`docs/handoff.md`](docs/handoff.md)의 맨 위 기록 몇 개와 `git log --oneline -10`, `git status`를 먼저 본다. 다른 도구가 하던 일 · 남긴 주의를 여기서 이어받는다.
- **끝낼 때**(커밋했거나 일을 멈출 때) `docs/handoff.md` 맨 위에 기록을 하나 더한다: 날짜 · 도구 · 커밋 · 한 일 · 남은 일 · 주의. 대화 기록은 도구끼리 넘어가지 않으니 다음 도구가 알아야 할 것은 전부 여기에. 결정은 `docs/decisions.md`에도.
- **커밋**: 사용자가 말할 때 한다. 커밋 전에 `git status` · `git diff`로 내가 바꾸지 않은 변경(다른 도구 · 다른 세션의 작업)이 섞이지 않았는지 보고, 남의 변경은 되돌리거나 함께 커밋하지 않는다. 커밋 메시지 맨 끝 줄에 만든 도구를 적는다(Claude Code는 `Co-Authored-By` 줄, 다른 도구는 `도구: Codex`처럼). 사용자가 볼 만한 변경이면 아래 `Discord-Note` 줄도 넣는다.
- **동시에 일할 때**: 두 도구가 같은 때에 돌면 서로 다른 파일을 맡거나, 도구마다 브랜치(`codex/<주제>` · `agy/<주제>`)에서 일하고 끝나면 `main`에 합친다. 한 도구만 돌 때는 `main`에서 바로.
- **원격**: GitHub **공개** 저장소 `dlawodnjs/HUSKY-GAME`(`origin`). 누구나 볼 수 있으니 토큰 · 비밀번호 · 개인 정보 · 서버 주소를 파일이나 커밋 메시지에 적지 않는다. 푸시는 사용자가 말할 때. 맥의 git은 `gh` 로그인(계정 `dlawodnjs`)으로 인증이 걸려 있어 어느 도구든 `git pull` · `git push` · `gh`를 그대로 쓴다.
- **다른 도구에게 묻기**(교차 검토 · 다른 의견): Claude Code → Codex는 `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex exec --sandbox read-only --ephemeral "<질문>"`(읽기만, 고치지 않음). 받은 답은 의견일 뿐이고 그대로 적용하지 않는다.

## 디스코드 업데이트 안내 (`Discord-Note`)
- 디스코드 서버(HUCODi Studio)는 허스키 구출 퍼즐과 함께 쓴다. 이 게임의 업데이트 내역은 🐕 허스키 메이커 구역의 `📜・메이커-업데이트` 채널에 올라간다. 서버 구성 · 맥에서 하는 절차는 husky-puzzle의 `docs/discord-community.md`.
- 커밋 메시지에 한 줄에 한 문장씩 적는다: `Discord-Note: [추가|개선|수정|안내] 한 문장`. 유저가 알아들을 말로(파일 이름 · 함수 이름 없이). 유저가 느낄 변화가 없는 커밋(문서 · 정리)은 적지 않거나 `[안내]`만.
- 게시 형식(퍼즐의 "게시 형식 v1"과 같고 제목만 다르다): 제목 `허스키 메이커 · 개발 업데이트 · YYYY-MM-DD`, 본문은 `추가 → 개선 → 수정 → 안내` 순서의 구역 제목과 `- 문장` 목록. 빈 구역 · 중복 문장은 뺀다.
- 채널 ID 등 설정은 [`tools/discord-updates.json`](tools/discord-updates.json). **봇 토큰은 이 저장소에 절대 넣지 않는다**(맥 키체인에만). 실제 게시는 맥의 게시 도구로 한다.

## 게임 구조
| 경로 | 내용 |
|---|---|
| `index.html` | 화면 틀(3단: 왼쪽 · 가운데 · 오른쪽) |
| `js/data.js` | 전역 상태 `state`, 행동 목록 `ActionType` · 이름 `actionNamesKR` |
| `js/ui.js` | 화면 갱신, 주간 일정표(행동 고르기 · 되돌리기), **행동이 열리는 능력치 조건** |
| `js/main.js` | 한 주 진행, **행동마다의 효과**(`case ActionType.…`) |
| `js/events.js` | 사건 · 엔딩 판정(12개월 = 48주에 엔딩) |
| `js/minigame.js` | 상점(장난감 · 뼈다귀 · 비타민 · 빗 · 가구) |
| `css/styles.css` · `assets/` | 겉모습 · 그림(엔딩 그림 포함) |
| 루트의 `*.ps1` · `*.py` · `merged_lines*.txt` | 예전 수정 · 디버그용 일회성 도구. 게임 실행에는 쓰지 않는다 |

- 실행: 윈도는 `serve.ps1`, 맥 · 리눅스는 저장소 폴더에서 `python3 -m http.server 8000` 뒤 `http://localhost:8000/`. 빌드 단계는 없다.
- 글 파일은 UTF-8로 저장한다(예전에 깨진 한글을 고친 적이 있다).
- **행동을 더하거나 고칠 때** 네 곳을 함께 본다: `ActionType`과 `actionNamesKR`(data.js), 열리는 조건(ui.js), 효과(main.js). 엔딩에 걸리면 events.js도.
- **썰매 끌기**(`SLED_PULLING`): 성견이 되고 힘 40 이상이면 열린다. 힘 +3 · 복종 +1, 야성 · 매력 −1, 체력 −8, 스트레스 · 피로 +5, 골드 +10. 민첩 · 힘이 모두 80 이상이면 엔딩 "썰매견 챔피언"(엔딩 판정은 위에서부터 먼저 맞는 것). 숫자를 바꾸면 결정 기록과 디스코드 안내(`Discord-Note`)에 남긴다.
