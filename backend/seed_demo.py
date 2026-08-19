"""Seed a ready-to-demo OnTrack account.

Usage (from the repo root, with the API running):
    backend/.venv/Scripts/python.exe backend/seed_demo.py

Creates demo@ontrack.local / demo1234 with three deadlines that exercise every
state the navigation flow shows: on-track, at-risk, and completed, plus a
session planned for today so the Today screen and the focus flow have content.
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

API = os.getenv('ONTRACK_API', 'http://127.0.0.1:8001')
EMAIL = os.getenv('ONTRACK_DEMO_EMAIL', 'demo@ontrack.local')
PASSWORD = os.getenv('ONTRACK_DEMO_PASSWORD', 'demo1234')

token = ''


def call(path: str, body: dict | None = None, method: str = 'POST'):
    data = json.dumps(body).encode() if body is not None else None
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    request = urllib.request.Request(f'{API}{path}', data=data, headers=headers, method=method)
    with urllib.request.urlopen(request) as response:
        return json.load(response)


def days(count: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=count)).isoformat()


def sign_in() -> str:
    try:
        return call('/api/v3/auth/register', {'email': EMAIL, 'password': PASSWORD, 'full_name': 'Alex Nguyen'})['token']
    except urllib.error.HTTPError as error:
        if error.code != 409:
            raise
        print(f'{EMAIL} already exists, signing in instead')
        return call('/api/v3/auth/login', {'email': EMAIL, 'password': PASSWORD})['token']


def build(title: str, due_in: int, priority: str, milestones: list[tuple[str, int, list[str]]]):
    deadline = call('/api/v3/deadlines', {'title': title, 'due_at': days(due_in), 'priority': priority})
    created = []
    for index, (name, target_in, tasks) in enumerate(milestones):
        milestone = call('/api/v3/milestones', {'deadline_id': deadline['id'], 'title': name, 'target_at': days(target_in), 'position': index})
        created.append((milestone, [
            call('/api/v3/tasks', {'milestone_id': milestone['id'], 'title': task, 'priority': priority, 'position': order})
            for order, task in enumerate(tasks)
        ]))
    return deadline, created


def record(task_id: str, minutes: int, progress: float, note: str, planned_at: str, focus: str = 'HIGH'):
    """Run a full session lifecycle so history, charts and rollups have real data."""
    session = call('/api/v3/sessions', {'task_id': task_id, 'planned_start_at': planned_at, 'estimated_minutes': minutes, 'focus_mode': focus})
    call(f"/api/v3/sessions/{session['id']}/start")
    call(f"/api/v3/sessions/{session['id']}/end?ended_early=false")
    call(f"/api/v3/sessions/{session['id']}/review", {'progress_after': progress, 'actual_minutes': minutes, 'result_note': note})
    return session


def reset_demo_data():
    """Make re-runs idempotent: without this a second run doubles every deadline."""
    for deadline in call('/api/v3/deadlines', method='GET'):
        call(f"/api/v3/deadlines/{deadline['id']}", method='DELETE')


def spread_history_over_the_week():
    """`end_session` stamps ended_at with now(), so every seeded session lands on today
    and the 7-day chart collapses into one bar. Align it with the planned day instead."""
    try:
        import psycopg
        from dotenv import load_dotenv
        from pathlib import Path
    except ImportError:
        print('psycopg not available - skipping history spread')
        return
    load_dotenv(Path(__file__).parent / '.env')
    url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ontrack')
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """update sessions s set
                     started_at = s.planned_start_at,
                     ended_at   = s.planned_start_at + (s.actual_minutes * interval '1 minute')
                   from tasks t
                   join milestones m on m.id = t.milestone_id
                   join deadlines d on d.id = m.deadline_id
                   join users u on u.id = d.user_id
                   where t.id = s.task_id and u.email = %s and s.ended_at is not null""",
                (EMAIL,),
            )
            print(f'  aligned {cur.rowcount} sessions with their planned day')
        conn.commit()


if __name__ == '__main__':
    token = sign_in()
    reset_demo_data()

    # 1. The at-risk hero deadline the flow diagram uses.
    _, fyp = build('Final Year Project', 20, 'HIGH', [
        ('Research & Planning', 4, ['Literature review', 'Scope definition']),
        ('System Design', 9, ['ERD & data model', 'API contract']),
        ('Implementation', 14, ['UI Design', 'API Integration', 'Database Setup']),
        ('Testing & Fixing', 19, ['Unit tests', 'Bug fixes']),
    ])
    research, design, implementation, _testing = fyp

    record(research[1][0]['id'], 60, 100, 'Reviewed 12 papers', days(-5))
    record(research[1][1]['id'], 45, 100, 'Scope locked', days(-4))
    record(design[1][0]['id'], 50, 80, 'ERD drafted', days(-2))
    record(design[1][1]['id'], 45, 60, 'Endpoints listed', days(-1))
    record(implementation[1][1]['id'], 45, 40, 'Auth endpoints wired', days(0), focus='NORMAL')

    # A session waiting on the Today screen, ready to start live in the demo.
    ui_design = implementation[1][0]
    planned = call('/api/v3/sessions', {
        'task_id': ui_design['id'],
        'planned_start_at': (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat(),
        'estimated_minutes': 45,
        'focus_mode': 'HIGH',
    })

    # 2. A healthy deadline, so the "on track" state is visible too.
    _, mobile = build('Mobile App Assignment', 60, 'MEDIUM', [
        ('Prototype', 20, ['Wireframes', 'Clickable prototype']),
    ])
    record(mobile[0][1][0]['id'], 40, 100, 'Wireframes approved', days(-3), focus='NORMAL')
    record(mobile[0][1][1]['id'], 40, 80, 'Prototype linked up', days(-1), focus='NORMAL')

    # 3. A finished deadline for the completed filter and the profile counter.
    _, report = build('Data Structures Report', 3, 'LOW', [('Write-up', 2, ['Draft', 'Proofread'])])
    for task in report[0][1]:
        record(task['id'], 30, 100, 'Submitted', days(-6), focus='NORMAL')

    spread_history_over_the_week()

    print('\nDemo data ready')
    print(f'  API      {API}')
    print(f'  login    {EMAIL} / {PASSWORD}')
    print(f'  session  {planned["id"]} is planned for 30 minutes from now (Today screen)')
    summary = call('/api/v3/deadlines', method='GET')
    for item in summary:
        print(f"  - {item['title']}: {item['progress']}% status={item['status']} risk={item['risk_level']}")
