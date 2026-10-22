#!/usr/bin/env python3
"""허스키 메이커의 Git 업데이트를 Discord에 올린다. 봇 토큰은 macOS 키체인에만 둔다.

husky-puzzle의 tools/discord_updates.py에서 옮겨 왔다(2026-10-23). 게시 형식 v1 · 확인 코드 ·
키체인 항목이 같아 두 도구가 같은 봇과 같은 기록 방식을 쓴다. 사용법은 docs/discord-updates.md."""

import argparse
import ctypes
import datetime
import fcntl
import getpass
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
import urllib.parse
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / 'tools/discord-updates.json'
PLAY = ROOT / 'docs/discord-play.md'
LOCAL = ROOT / '.local/discord-updates'
DEFAULT_TITLE = '허스키 메이커 · 개발 업데이트 · {date}'
SERVICE = 'hucodi.husky.discord-updates'
ACCOUNT = 'discord-bot'
MARKER = re.compile(r'husky-v1:([0-9a-f]{12}):([0-9a-f]{16}):(\d+)/(\d+)')
NOTE_KINDS = ('추가', '개선', '수정', '안내')


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args], text=True).strip()


def keychain_token(value=None):
    """Use Security.framework so the token never appears in subprocess arguments."""
    if sys.platform != 'darwin':
        raise RuntimeError('macOS 키체인이 필요합니다. 다른 환경에서는 DISCORD_BOT_TOKEN을 지정하세요.')
    security = ctypes.CDLL('/System/Library/Frameworks/Security.framework/Security')
    find = security.SecKeychainFindGenericPassword
    find.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_char_p,
                     ctypes.c_uint32, ctypes.c_char_p, ctypes.POINTER(ctypes.c_uint32),
                     ctypes.POINTER(ctypes.c_void_p), ctypes.POINTER(ctypes.c_void_p)]
    find.restype = ctypes.c_int32
    free = security.SecKeychainItemFreeContent
    free.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    free.restype = ctypes.c_int32
    service, account = SERVICE.encode(), ACCOUNT.encode()
    length, data, item = ctypes.c_uint32(), ctypes.c_void_p(), ctypes.c_void_p()
    status = find(None, len(service), service, len(account), account,
                  ctypes.byref(length), ctypes.byref(data), ctypes.byref(item))
    existing = None
    if status == 0:
        existing = ctypes.string_at(data, length.value).decode()
        free(None, data)
    elif status != -25300:
        raise RuntimeError(f'키체인을 읽지 못했습니다 (상태 {status}).')
    try:
        if value is None:
            if existing is None:
                raise RuntimeError('봇 토큰이 없습니다. install --store-token으로 등록하세요.')
            return existing
        secret = value.encode()
        if status == 0:
            modify = security.SecKeychainItemModifyAttributesAndData
            modify.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_uint32, ctypes.c_char_p]
            modify.restype = ctypes.c_int32
            result = modify(item, None, len(secret), secret)
        else:
            add = security.SecKeychainAddGenericPassword
            add.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_char_p,
                            ctypes.c_uint32, ctypes.c_char_p, ctypes.c_uint32,
                            ctypes.c_char_p, ctypes.c_void_p]
            add.restype = ctypes.c_int32
            result = add(None, len(service), service, len(account), account,
                         len(secret), secret, None)
        if result:
            raise RuntimeError(f'키체인에 저장하지 못했습니다 (상태 {result}).')
    finally:
        if item.value:
            cf = ctypes.CDLL('/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation')
            cf.CFRelease.argtypes = [ctypes.c_void_p]
            cf.CFRelease(item)


class Discord:
    def __init__(self, token):
        self.token = token

    def call(self, path, method='GET', body=None):
        for attempt in range(3):
            request = urllib.request.Request(
                'https://discord.com/api/v10' + path,
                data=None if body is None else json.dumps(body).encode(),
                headers={'Authorization': 'Bot ' + self.token,
                         'Content-Type': 'application/json',
                         'User-Agent': 'DiscordBot (https://discord.com, 1.0)'},
                method=method)
            try:
                with urllib.request.urlopen(request, timeout=8) as response:
                    raw = response.read()
                    return json.loads(raw) if raw else None
            except urllib.error.HTTPError as error:
                if error.code == 429:
                    retry = json.loads(error.read()).get('retry_after', 1)
                    if retry > 15 or attempt == 2:
                        raise RuntimeError('Discord 요청 제한입니다. 다음 실행에서 재시도합니다.') from None
                    time.sleep(max(0.2, retry) + .2)
                    continue
                # Never print request headers, credentials or response contents.
                raise RuntimeError(f'Discord HTTP {error.code}. 권한과 토큰을 확인하세요.') from None
            except (urllib.error.URLError, TimeoutError, OSError):
                raise RuntimeError('Discord 연결에 실패했습니다. 다음 실행에서 재시도합니다.') from None


def read_state():
    path = LOCAL / 'state.json'
    if path.exists():
        return json.loads(path.read_text())
    return {'version': 1, 'covered': [], 'last_message_id': None, 'outbox': None}


def save_state(state):
    LOCAL.mkdir(parents=True, exist_ok=True)
    path = LOCAL / 'state.json'
    temp = LOCAL / 'state.tmp'
    temp.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n')
    os.replace(temp, path)


def reachable(ref):
    return git('rev-list', '--reverse', '--topo-order', ref).splitlines()


def scan_history(client, channel_id, bot_id, after=None):
    """Only trust checkpoints written by this bot; recover even without local state."""
    markers, newest, before = {}, after, None
    while True:
        path = f'/channels/{channel_id}/messages?limit=100'
        if before:
            path += '&before=' + before
        messages = client.call(path)
        if not messages:
            break
        for message in messages:
            mid = message['id']
            if newest is None or int(mid) > int(newest):
                newest = mid
            if after and int(mid) <= int(after):
                return markers, newest
            if message.get('author', {}).get('id') != bot_id:
                continue
            for embed in message.get('embeds', []):
                marker = MARKER.fullmatch(embed.get('footer', {}).get('text', ''))
                if marker:
                    tip, batch, part, total = marker.groups()
                    record = markers.setdefault(batch, {'tip': tip, 'total': int(total), 'parts': {}})
                    if record['tip'] == tip and record['total'] == int(total):
                        record['parts'][int(part)] = mid
        if len(messages) < 100:
            break
        before = messages[-1]['id']
    return markers, newest


def recover(state, markers):
    covered = set(state['covered'])
    for batch in markers.values():
        if set(batch['parts']) == set(range(1, batch['total'] + 1)):
            try:
                tip = git('rev-parse', '--verify', batch['tip'] + '^{commit}')
                covered.update(reachable(tip))
            except subprocess.CalledProcessError:
                continue  # A different clone may not have this branch yet.
    state['covered'] = sorted(covered)


def clean_note(text):
    text = re.sub(r'https?://\S+', '[링크 생략]', text)
    text = re.sub(r'[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{20,}', '[인증 정보 생략]', text)
    text = text.replace('@', '＠').replace('```', '')
    return text.strip()[:450]


def note_entry(text, fallback='개선'):
    match = re.match(r'^\[(추가|개선|수정|안내)\]\s*(.+)$', text.strip())
    kind, text = match.groups() if match else (fallback, text)
    return kind, clean_note(text)


def commit_entries(sha):
    body = git('show', '-s', '--format=%B', sha)
    explicit = re.findall(r'^Discord-Note:[ \t]*(.+)$', body, re.MULTILINE | re.IGNORECASE)
    if explicit:
        return [note_entry(line) for line in explicit]
    files = git('diff-tree', '--root', '--no-commit-id', '--name-only', '-r', sha).splitlines()
    if files and all(p.startswith(('docs/', '.githooks/', 'tools/', '.claude/')) or p in ('AGENTS.md', 'CLAUDE.md', '.gitignore') for p in files):
        return [('안내', '개발 문서와 작업 도구를 정리했습니다.')]
    title = body.splitlines()[0]
    title = re.sub(r'^(고도|서버|정리|수정|개선|기능|fix|feat|chore|refactor)(\([^)]*\))?[:：]\s*', '', title, flags=re.IGNORECASE)
    fallback = '수정' if re.search(r'수정|고침|오류|버그', body.splitlines()[0], re.I) else '개선'
    return [note_entry(title, fallback)]


def format_entries(entries):
    groups = {kind: [] for kind in NOTE_KINDS}
    for kind, text in entries:
        if text and text not in groups[kind]:
            groups[kind].append(text)
    return '\n\n'.join('**'+kind+'**\n'+'\n'.join('- '+text for text in groups[kind])
                        for kind in NOTE_KINDS if groups[kind])


def default_notes(commits):
    return format_entries(entry for sha in commits for entry in commit_entries(sha))


def canonical_notes(text):
    """Custom drafts use the same headings and bullets as generated updates."""
    entries, kind = [], None
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line in ['**'+name+'**' for name in NOTE_KINDS]:
            kind = line[2:-2]
        elif kind and line.startswith('- ') and line[2:].strip():
            entries.append((kind, clean_note(line[2:])))
        else:
            raise RuntimeError('업데이트 원고는 **추가**·**개선**·**수정**·**안내** 제목과 "- 내용"만 사용하세요. docs/discord-updates.md 참고.')
    notes = format_entries(entries)
    if not notes:
        raise RuntimeError('게시할 업데이트 내용이 비어 있습니다.')
    return notes


def publication_date(tip):
    timestamp = datetime.datetime.fromisoformat(git('show', '-s', '--format=%cI', tip))
    return timestamp.astimezone(ZoneInfo('Asia/Seoul')).date().isoformat()


def split_notes(text, limit=3400):
    def units(value):
        return len(value.encode('utf-16-le')) // 2

    pages, current = [], ''
    for section in re.split(r'\n---\s*\n', text.strip()):
        heading = None
        lines = section.splitlines()
        for index, line in enumerate(lines):
            if line in ['**'+name+'**' for name in NOTE_KINDS]:
                heading = line
                next_line = next((item for item in lines[index+1:] if item.strip()), '')
                if current.strip() and units(current) + units(line) + units(next_line) + 2 > limit:
                    pages.append(current.strip())
                    current = ''
            while units(line) > limit:
                if current.strip():
                    pages.append(current.strip())
                    current = ''
                cut, size = 0, 0
                for char in line:
                    if size + units(char) > limit:
                        break
                    size += units(char)
                    cut += 1
                pages.append(line[:cut])
                line = line[cut:]
            if units(current) + units(line) + 1 > limit:
                pages.append(current.strip())
                current = heading + '\n' if heading and line != heading else ''
            current += line + '\n'
        if current.strip():
            pages.append(current.strip())
            current = ''
    if not pages:
        raise RuntimeError('게시할 업데이트 본문이 비어 있습니다.')
    return pages


def make_batch(tip, commits, notes, event, title_format=DEFAULT_TITLE):
    pages = split_notes(notes)
    seed = json.dumps([tip, commits, pages], ensure_ascii=False).encode()
    batch_id = hashlib.sha256(seed).hexdigest()[:16]
    title = title_format.format(date=publication_date(tip))
    payloads = []
    for index, page in enumerate(pages, 1):
        marker = f'husky-v1:{tip[:12]}:{batch_id}:{index}/{len(pages)}'
        nonce = str(int(hashlib.sha256(marker.encode()).hexdigest()[:16], 16))
        page_title = title + (f' ({index}/{len(pages)})' if len(pages) > 1 else '')
        payloads.append({'embeds': [{'title': page_title,
                                    'description': page, 'color': 5793266,
                                    'footer': {'text': marker}}],
                         'allowed_mentions': {'parse': []}, 'flags': 4096,
                         'nonce': nonce, 'enforce_nonce': True})
    return {'id': batch_id, 'tip': tip, 'commits': commits, 'event': event,
            'payloads': payloads, 'sent': {}}


def flush_outbox(state, client, channel_id, markers):
    batch = state.get('outbox')
    if not batch:
        return 0
    found = markers.get(batch['id'], {}).get('parts', {})
    for index, payload in enumerate(batch['payloads'], 1):
        key = str(index)
        if key in batch['sent']:
            continue
        if index in found:
            batch['sent'][key] = found[index]
        else:
            message = client.call(f'/channels/{channel_id}/messages', 'POST', payload)
            batch['sent'][key] = message['id']
        # Save every successful page. Failed/uncertain sends remain in the outbox.
        save_state(state)
    count = len(batch['commits'])
    state['covered'] = sorted(set(state['covered']) | set(batch['commits']))
    state['last_message_id'] = max([v for v in batch['sent'].values()] +
                                  [state.get('last_message_id') or '0'], key=int)
    state['outbox'] = None
    save_state(state)
    print(f'Discord: 커밋 {count}개를 반영했습니다 ({len(batch["payloads"])}개 게시물).')
    return count


def sync(args):
    config = json.loads(CONFIG.read_text())
    ref = git('rev-parse', '--verify', args.ref + '^{commit}')
    all_commits = reachable(ref)
    LOCAL.mkdir(parents=True, exist_ok=True)
    with (LOCAL / 'publish.lock').open('w') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print('Discord: 다른 게시 작업이 진행 중입니다. 남은 내용은 다음 실행에서 확인합니다.')
            return
        state = read_state()
        pending = [c for c in all_commits if c not in set(state['covered'])]
        if args.dry_run:
            if args.notes:
                notes = canonical_notes(Path(args.notes).read_text())
            else:
                notes = default_notes(pending)
            print(json.dumps({'pending_commits':len(pending), 'pages':split_notes(notes) if pending else []}, ensure_ascii=False, indent=2))
            return
        token = os.environ.get('DISCORD_BOT_TOKEN') or keychain_token()
        client = Discord(token)
        me = client.call('/users/@me')
        if not me.get('bot') or me['id'] != config['bot_id']:
            raise RuntimeError('설정된 Discord 봇과 인증 정보가 일치하지 않습니다.')
        channel = client.call('/channels/' + config['channel_id'])
        if channel.get('guild_id') != config['guild_id']:
            raise RuntimeError('Discord 서버가 설정과 다릅니다.')
        markers, newest = scan_history(client, config['channel_id'], me['id'], state.get('last_message_id'))
        recover(state, markers)
        state['last_message_id'] = newest
        save_state(state)
        flush_outbox(state, client, config['channel_id'], markers)
        pending = [c for c in all_commits if c not in set(state['covered'])]
        if not pending:
            print('Discord: 미게시 커밋이 없습니다.')
            return
        notes = canonical_notes(Path(args.notes).read_text()) if args.notes else default_notes(pending)
        state['outbox'] = make_batch(ref, pending, notes, args.event,
                                     config.get('post_title_format', DEFAULT_TITLE))
        save_state(state)
        flush_outbox(state, client, config['channel_id'], {})


def play(args):
    """Update (or first post) the pinned guide in the play channel from docs/discord-play.md."""
    config = json.loads(CONFIG.read_text())
    lines = PLAY.read_text().splitlines()
    try:
        start = lines.index('<!-- 게시 시작 -->') + 1
        end = lines.index('<!-- 게시 끝 -->')
    except ValueError:
        raise RuntimeError('docs/discord-play.md에 게시 시작 · 끝 표시가 없습니다.') from None
    title, body = lines[start].lstrip('# ').strip(), '\n'.join(lines[start+1:end]).strip()
    channels = {key[:-11]: config[key] for key in config if key.endswith('_channel_id') and config[key]}
    channels['updates'] = config['channel_id']
    body = re.sub(r'\{#(\w+)\}', lambda m: f'<#{channels[m.group(1)]}>', body)
    content = {'embeds': [{'title': title, 'description': body, 'color': 5793266}],
               'allowed_mentions': {'parse': []}}
    if args.dry_run:
        print(json.dumps(content, ensure_ascii=False, indent=2))
        return
    client = Discord(os.environ.get('DISCORD_BOT_TOKEN') or keychain_token())
    me = client.call('/users/@me')
    if me['id'] != config['bot_id'] or not me.get('bot'):
        raise RuntimeError('설정된 Discord 봇과 인증 정보가 일치하지 않습니다.')
    cid = config['play_channel_id']
    if client.call('/channels/' + cid).get('guild_id') != config['guild_id']:
        raise RuntimeError('플레이 채널이 설정과 다릅니다.')
    if config.get('play_message_id'):
        message = client.call(f'/channels/{cid}/messages/' + config['play_message_id'], 'PATCH', content)
    else:
        message = client.call(f'/channels/{cid}/messages', 'POST', {**content, 'flags': 4096})
        config['play_message_id'] = message['id']
        CONFIG.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
    client.call(f'/channels/{cid}/messages/pins/' + message['id'], 'PUT')
    print(f"Discord 플레이 안내: https://discord.com/channels/{config['guild_id']}/{cid}/{message['id']}")


def install(args):
    if args.store_token:
        token = getpass.getpass('Discord bot token (hidden): ').strip()
        if not token:
            raise RuntimeError('토큰이 비어 있습니다.')
        keychain_token(token)
        print('봇 토큰을 macOS 키체인에 저장했습니다.')
    current = subprocess.run(['git', '-C', str(ROOT), 'config', '--get', 'core.hooksPath'], text=True, capture_output=True)
    if current.stdout.strip() not in ('', '.githooks'):
        raise RuntimeError('기존 core.hooksPath가 있어 자동 교체하지 않았습니다.')
    hook_dir = Path(git('rev-parse', '--git-path', 'hooks'))
    if not hook_dir.is_absolute():
        hook_dir = ROOT / hook_dir
    if not current.stdout.strip() and hook_dir.exists() and any(
            p.is_file() and not p.name.endswith('.sample') for p in hook_dir.iterdir()):
        raise RuntimeError('기존 Git 훅이 있어 자동 교체하지 않았습니다.')
    for name in ['post-commit','pre-push']:
        (ROOT / '.githooks' / name).chmod(0o755)
    git('config', '--local', 'core.hooksPath', '.githooks')
    print('Git post-commit / pre-push 훅을 설치했습니다.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    publish = commands.add_parser('sync')
    publish.add_argument('--ref', default='HEAD')
    publish.add_argument('--event', choices=['commit','push','manual'], default='manual')
    publish.add_argument('--notes', help='검토한 한국어 업데이트 본문 파일')
    publish.add_argument('--dry-run', action='store_true')
    setup = commands.add_parser('install')
    setup.add_argument('--store-token', action='store_true')
    guide = commands.add_parser('play')
    guide.add_argument('--dry-run', action='store_true')
    commands.add_parser('status')
    args = parser.parse_args()
    try:
        if args.command == 'sync':
            sync(args)
        elif args.command == 'install':
            install(args)
        elif args.command == 'play':
            play(args)
        else:
            state = read_state()
            pending = set(reachable('HEAD')) - set(state['covered'])
            print(json.dumps({'미게시_커밋':len(pending), '전송_대기':bool(state.get('outbox'))}, ensure_ascii=False))
    except (RuntimeError, OSError, ValueError, subprocess.CalledProcessError) as error:
        print(f'Discord: {error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
