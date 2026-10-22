import argparse
import contextlib
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[1] / 'discord_updates.py'  # husky-puzzle의 같은 검사에서 옮겨 옴
spec = importlib.util.spec_from_file_location('discord_updates', SOURCE)
updates = importlib.util.module_from_spec(spec)
spec.loader.exec_module(updates)


class FakeDiscord:
    def __init__(self):
        self.messages = []
        self.fail_at = None
        self.uncertain_at = None
        self.attempts = 0

    def call(self, path, method='GET', body=None):
        if path == '/users/@me':
            return {'id':'bot','bot':True}
        if path == '/channels/channel':
            return {'id':'channel','guild_id':'guild'}
        if method == 'GET' and '/messages?' in path:
            before = path.split('&before=')[-1] if '&before=' in path else None
            return [m for m in reversed(self.messages) if before is None or int(m['id']) < int(before)][:100]
        if method == 'POST':
            self.attempts += 1
            if self.attempts == self.fail_at:
                raise RuntimeError('연결 실패')
            message = {**body,'id':str(len(self.messages)+1000),'author':{'id':'bot'}}
            self.messages.append(message)
            if self.attempts == self.uncertain_at:
                raise RuntimeError('응답을 받기 전에 연결 종료')
            return message
        raise AssertionError((path, method))


class PublishTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.command('init', '--quiet', '--initial-branch=main')
        self.command('config', 'user.name', 'Test')
        self.command('config', 'user.email', 'test@example.invalid')
        self.command('config', 'core.hooksPath', str(self.root/'empty-hooks'))
        self.sha = self.commit('게임: 첫 기능\n\nDiscord-Note: 플레이 되돌리기를 추가했습니다.')
        self.config = self.root/'discord.json'
        self.config.write_text(json.dumps({'guild_id':'guild','bot_id':'bot','channel_id':'channel'}))
        self.fake = FakeDiscord()
        self.stack = contextlib.ExitStack()
        self.stack.enter_context(patch.object(updates,'ROOT',self.root))
        self.stack.enter_context(patch.object(updates,'LOCAL',self.root/'local'))
        self.stack.enter_context(patch.object(updates,'CONFIG',self.config))
        self.stack.enter_context(patch.object(updates,'Discord',return_value=self.fake))
        self.stack.enter_context(patch.dict(os.environ,{'DISCORD_BOT_TOKEN':'not-a-real-token'}))

    def tearDown(self):
        self.stack.close()
        self.temp.cleanup()

    def command(self, *args):
        return subprocess.check_output(['git','-C',str(self.root),*args],text=True).strip()

    def commit(self, message):
        self.command('commit','--quiet','--allow-empty','-m',message)
        return self.command('rev-parse','HEAD')

    def sync(self, notes=None, event='commit'):
        with contextlib.redirect_stdout(io.StringIO()):
            updates.sync(argparse.Namespace(ref='HEAD',notes=notes,event=event,dry_run=False))

    def two_pages(self):
        path = self.root/'notes.md'
        path.write_text('**추가**\n'+'\n'.join('- '+str(i)+'번째 변경 '+('가'*440) for i in range(8)))
        return str(path)

    def test_note_categories_have_fixed_order_and_no_duplicate_bullets(self):
        self.commit('고도: 조작 변경\n\nDiscord-Note: [수정] 대사 입력 문제를 수정했습니다.\nDiscord-Note: [추가] 새로운 퍼즐을 추가했습니다.\nDiscord-Note: [안내] 시험판 설치를 안내합니다.\nDiscord-Note: [추가] 새로운 퍼즐을 추가했습니다.')
        notes = updates.default_notes(updates.reachable('HEAD'))
        self.assertLess(notes.index('**추가**'),notes.index('**개선**'))
        self.assertLess(notes.index('**개선**'),notes.index('**수정**'))
        self.assertLess(notes.index('**수정**'),notes.index('**안내**'))
        self.assertEqual(notes.count('새로운 퍼즐을 추가했습니다.'),1)
        self.assertNotIn(self.sha[:7],notes)
    def test_custom_draft_is_canonical_and_rejects_other_layouts(self):
        self.assertEqual(updates.canonical_notes('**수정**\n- 오류 수정\n\n**추가**\n- 새 퍼즐\n- 새 퍼즐'),
                         '**추가**\n- 새 퍼즐\n\n**수정**\n- 오류 수정')
        with self.assertRaises(RuntimeError):
            updates.canonical_notes('# 저만의 업데이트 제목\n• 변경 사항')
    def test_title_uses_korean_commit_date_and_multipart_keeps_headings(self):
        with patch.dict(os.environ,{'GIT_COMMITTER_DATE':'2026-10-16T18:30:00+00:00'}):
            tip = self.commit('고도: 수정')
        notes = updates.canonical_notes(Path(self.two_pages()).read_text())
        batch = updates.make_batch(tip,[tip],notes,'commit')
        self.assertEqual(len(batch['payloads']),2)
        for index,payload in enumerate(batch['payloads'],1):
            self.assertEqual(payload['embeds'][0]['title'],f'허스키 메이커 · 개발 업데이트 · 2026-10-17 ({index}/2)')
            self.assertTrue(payload['embeds'][0]['description'].startswith('**추가**\n- '))
    def test_page_break_does_not_leave_an_empty_heading(self):
        pages = updates.split_notes('**추가**\n- '+'가'*40+'\n\n**수정**\n- 오류를 수정했습니다.',limit=60)
        self.assertEqual(len(pages),2)
        self.assertTrue(pages[1].startswith('**수정**\n- '))
        self.assertFalse(any(page.endswith('**수정**') for page in pages))
    def test_commit_then_push_is_not_duplicated(self):
        second = self.commit('고도: 두 번째 기능')
        self.sync()
        self.sync(event='push')
        self.assertEqual(len(self.fake.messages),1)
        self.assertEqual(set(updates.read_state()['covered']),{self.sha,second})
        self.assertIn('플레이 되돌리기',self.fake.messages[0]['embeds'][0]['description'])
    def test_offline_backlog_is_included_next_time(self):
        self.fake.fail_at = 1
        with self.assertRaises(RuntimeError):
            self.sync()
        self.assertEqual(updates.read_state()['covered'],[])
        second = self.commit('고도: 화면 잘림 수정')
        self.fake.fail_at = None
        self.sync(event='push')
        self.assertEqual(set(updates.read_state()['covered']),{self.sha,second})
        self.assertEqual(len(self.fake.messages),2)
    def test_partial_batch_resumes_without_reposting_successful_page(self):
        self.fake.fail_at = 2
        with self.assertRaises(RuntimeError):
            self.sync(self.two_pages())
        self.assertEqual(updates.read_state()['covered'],[])
        self.assertEqual(len(self.fake.messages),1)
        self.fake.fail_at = None
        self.sync()
        self.assertEqual(len(self.fake.messages),2)
        self.assertIsNone(updates.read_state()['outbox'])
    def test_server_received_message_but_response_was_lost(self):
        self.fake.uncertain_at = 2
        with self.assertRaises(RuntimeError):
            self.sync(self.two_pages())
        self.sync()
        self.assertEqual(len(self.fake.messages),2)
        self.assertEqual(updates.read_state()['covered'],[self.sha])
    def test_deleted_local_ledger_recovers_from_discord(self):
        self.sync(self.two_pages())
        (updates.LOCAL/'state.json').unlink()
        self.sync()
        self.assertEqual(len(self.fake.messages),2)
        self.assertEqual(updates.read_state()['covered'],[self.sha])
    def test_other_users_cannot_forge_posted_checkpoints(self):
        batch = updates.make_batch(self.sha,[self.sha],'가짜 게시물','manual')
        self.fake.messages.append({**batch['payloads'][0], 'id':'999','author':{'id':'another-user'}})
        self.sync()
        self.assertEqual(len(self.fake.messages),2)
    def test_incomplete_batch_does_not_cover_commits(self):
        state = {'covered':[]}
        updates.recover(state,{'batch':{'tip':self.sha[:12],'total':2,'parts':{1:'123'}}})
        self.assertEqual(state['covered'],[])
    def test_unicode_pages_fit_discord_utf16_limits(self):
        text = '🐾' * 4000
        pages = updates.split_notes(text)
        self.assertEqual(''.join(pages),text)
        self.assertTrue(all(len(page.encode('utf-16-le'))//2 <= 3400 for page in pages))
    def test_mentions_and_token_patterns_are_redacted(self):
        note = updates.clean_note('@everyone ' + 'A'*24+'.'+'B'*8+'.'+'C'*30)
        self.assertNotIn('@everyone',note)
        self.assertNotIn('C'*30,note)
    def test_hooks_do_not_fail_git_when_publishing_fails(self):
        binary = self.root/'bin'
        binary.mkdir()
        stub = binary/'python3'
        log = self.root/'hook.log'
        stub.write_text('#!/bin/sh\necho "$*" >> "$HOOK_LOG"\nexit 1\n')
        stub.chmod(0o755)
        env = {**os.environ,'PATH':str(binary)+':'+os.environ['PATH'],'HOOK_LOG':str(log)}
        hook_root = SOURCE.parents[1]/'.githooks'
        post = subprocess.run(['sh',str(hook_root/'post-commit')],cwd=self.root,env=env,capture_output=True)
        pushes = f'refs/heads/main {self.sha} refs/heads/main {"0"*40}\nrefs/heads/removed {"0"*40} refs/heads/removed {self.sha}\n'
        pre = subprocess.run(['sh',str(hook_root/'pre-push')],input=pushes,text=True,cwd=self.root,env=env,capture_output=True)
        self.assertEqual(post.returncode,0)
        self.assertEqual(pre.returncode,0)
        calls = log.read_text().splitlines()
        self.assertEqual(len(calls),2)
        self.assertIn('--event commit',calls[0])
        self.assertIn('--event push --ref '+self.sha,calls[1])

    def test_title_is_maker_and_play_guide_patches_same_pinned_message(self):
        self.sync()
        self.assertTrue(self.fake.messages[0]['embeds'][0]['title'].startswith('허스키 메이커 · 개발 업데이트 · '))
        config = json.loads(self.config.read_text())
        config.update({'play_channel_id':'play','sled_channel_id':'sled','feedback_channel_id':'fb'})
        self.config.write_text(json.dumps(config))
        guide = self.root/'play.md'
        guide.write_text('설명\n<!-- 게시 시작 -->\n# 제목\n- 썰매는 {#sled}, 소식은 {#updates}\n<!-- 게시 끝 -->\n')
        calls = []
        def request(path, method='GET', body=None):
            calls.append((path, method, body))
            if path == '/users/@me':
                return {'id':'bot','bot':True}
            if path == '/channels/play':
                return {'id':'play','guild_id':'guild'}
            if method == 'POST':
                return {'id':'777'}
            if method in ('PATCH','PUT'):
                return {'id':'777'}
            raise AssertionError((path, method))
        with patch.object(updates,'PLAY',guide), patch.object(self.fake,'call',side_effect=request), contextlib.redirect_stdout(io.StringIO()):
            updates.play(argparse.Namespace(dry_run=False))
            updates.play(argparse.Namespace(dry_run=False))
        posts = [c for c in calls if c[1] == 'POST']
        patches = [c for c in calls if c[1] == 'PATCH']
        self.assertEqual(len(posts), 1)
        self.assertEqual(patches[0][0], '/channels/play/messages/777')
        embed = posts[0][2]['embeds'][0]
        self.assertEqual(embed['title'], '제목')
        self.assertEqual(embed['description'], '- 썰매는 <#sled>, 소식은 <#channel>')
        self.assertEqual(json.loads(self.config.read_text())['play_message_id'], '777')



if __name__ == '__main__':
    unittest.main()
