# 인수인계 기록

> 문서 분류: **작업 기록** · 여러 AI 도구(Claude Code · Codex · Antigravity)가 서로 일을 이어받는 곳.
> 규칙은 [AGENTS.md](../AGENTS.md)의 "여러 AI 도구가 함께 일하기". 결정은 [decisions.md](decisions.md)에 따로 적는다.

**쓰는 법**
- 일을 시작할 때 맨 위 기록 몇 개를 읽는다.
- 커밋했거나 일을 멈출 때 **맨 위에** 기록 하나를 더한다(새것이 위).
- 짧게 적는다: 무엇을 했는지보다 **다음 도구가 알아야 할 것**(남은 일 · 깨지기 쉬운 곳 · 사용자가 기다리는 것)을.
- 기록이 20개를 넘으면 오래된 것부터 지운다(git 기록에 남는다).

```
## 2026-10-22 · Claude Code · 커밋 abc1234
- 한 일:
- 남은 일:
- 주의:
```

---

## 2026-10-23 · Claude Code(맥) · 디스코드 게시 도구를 이 저장소에 (커밋: 이 기록이 든 커밋)
- 한 일: husky-puzzle의 게시 도구를 옮겨 `tools/discord_updates.py`(`status` · `sync` · `play`) · `tools/tests/` · `.githooks/` · `docs/discord-play.md`(플레이 고정 글 원고) · `docs/discord-updates.md`(쓰는 법)를 넣었다. 퍼즐 전용인 다운로드 안내는 뺐다. 중복 방지 기록을 이 저장소의 `.local/discord-updates/`로 옮겼다(`.gitignore`). 검사 15개 통과.
- 남은 일: 훅은 **걸지 않았다**(`python3 tools/discord_updates.py install`을 돌리면 커밋 · 푸시 때 저절로 올라간다 — 사용자가 정한다). 그 전까지는 사용자에게 보일 커밋 뒤에 `sync`를 직접.
- 주의: 공개 저장소다. 도구에 토큰 · 서버 주소가 없다(키체인 이름만). 이 커밋은 문서 · 도구뿐이라 게시됨으로 넣어 두었다.

## 2026-10-23 · Claude Code(맥) · 디스코드 허스키 메이커 구역 열기 (커밋: e8fc9d1 · 이 기록이 든 커밋)
- 한 일: HUCODi Studio에 🐕 허스키 메이커 구역(`📜・메이커-업데이트` 봇만 · `🎮・메이커-플레이` · `🛷・썰매-끌기` · `💬・메이커-피드백`)을 만들고 ID를 `tools/discord-updates.json`에 적었다. 첫 개발 업데이트(2026-10-23, 그때까지 커밋 12개)를 올리고, 플레이 방법 글을 고정했다(플레이 주소는 "준비 중"). 서버 안내 글에 메이커 한 줄을 더했다. 계획에 있던 `📣・공지`는 기존 `📢・공지사항`이 있어 만들지 않았다.
- 남은 일: 플레이 주소가 정해지면 고정 글을 고친다(`play_message_id`). **이 저장소에는 게시 훅이 없다** — 사용자에게 보일 커밋을 한 뒤 맥의 husky-puzzle에서 `python3 tools/discord_updates.py --repo ../HUSKY-GAME sync`를 돌린다(`--dry-run`으로 먼저 보기).
- 주의: 중복 방지 기록은 husky-puzzle 쪽 `.local/discord-updates/husky-maker/state.json`(맥에만). 이 기록 커밋은 게시됨으로 넣어 두어 다시 올라가지 않는다.

## 2026-10-23 · Claude Code(맥) · 협업 규칙을 main에 합침 (커밋: 이 기록이 든 커밋)
- 한 일: 아래 기록의 브랜치 `claude/magical-knuth-z5f3yz`(de63d43)를 `main`에 빨리 감기로 합치고 푸시했다. 맥의 `~/Documents/claude_code/HUSKY-GAME` 폴더를 `main`으로 돌려 GitHub와 맞췄다. 게임 코드는 바꾸지 않았다.
- 남은 일: 아래 기록의 디스코드 채널 만들기 · ID 적기는 그대로. 원격 브랜치 `claude/magical-knuth-z5f3yz`는 이제 `main`에 다 들어 있어 지워도 되지만, 지울지는 사용자가 정한다.
- 주의: 다른 클라우드 브랜치 셋(`claude/husky-coop-game-design-lvubb1` 3D 썰매 협동 · `claude/happy-gauss-f3ymne` 픽셀 아트 WIP · `claude/what-do-you-have-rlqlil` 능력치 6종 · 엔딩 도감)은 `main`에 합치지 않았다. 맥 폴더는 앞으로 `main`에서 `git pull` · `git push`로 맞춘다.

## 2026-10-22 · Claude Code(클라우드 세션) · 협업 규칙 · 디스코드 준비 (커밋: 이 기록이 든 커밋, 브랜치 `claude/magical-knuth-z5f3yz`)
- 한 일: husky-puzzle의 협업 규칙을 옮겨 `AGENTS.md` · `CLAUDE.md` · 이 문서 · `docs/decisions.md`를 만들었다. 커밋 메시지의 `Discord-Note` 규칙과 디스코드 설정 틀 `tools/discord-updates.json`(채널 ID 비어 있음)을 더했다. 게임 코드는 바꾸지 않았다.
- 남은 일(맥에서): husky-puzzle의 `docs/discord-community.md` 순서대로 🐕 허스키 메이커 구역 채널을 만들고, 새 ID를 `tools/discord-updates.json`에 적고, 게시 도구가 이 저장소의 커밋도 읽게 넓힌 뒤 첫 게시 초안을 올린다. 이 브랜치를 `main`에 합칠지는 사용자가 정한다.
- 주의: 공개 저장소다. 봇 토큰 · 서버 주소를 넣지 않는다. `🎮・메이커-플레이`에 걸 플레이 주소(예: GitHub Pages)는 아직 정하지 않았다.
