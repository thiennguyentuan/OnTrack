from __future__ import annotations

import os
import hashlib
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from pathlib import Path
from typing import Any
from uuid import UUID

import bcrypt
import jwt
import psycopg
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from psycopg.rows import dict_row

load_dotenv(Path(__file__).parents[1] / '.env')
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/ontrack')
JWT_SECRET = os.getenv('JWT_SECRET', 'ontrack-demo-secret')
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_STARTTLS = os.getenv('SMTP_STARTTLS', 'true').lower() == 'true'
SMTP_USERNAME = os.getenv('SMTP_USERNAME')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
SMTP_FROM = os.getenv('SMTP_FROM')
APP_RESET_URL = os.getenv('APP_RESET_URL', 'http://localhost:8081/reset-password')

app = FastAPI(title='OnTrack API', version='3.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

def db():
    return psycopg.connect(DATABASE_URL, row_factory=dict_row)

def query(sql: str, params: tuple[Any, ...] = (), one: bool = False):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            if cur.description is None:
                rows = None if one else []
            else:
                rows = cur.fetchone() if one else cur.fetchall()
        conn.commit()
        return rows

def token_for(user_id: UUID) -> str:
    return jwt.encode({'sub': str(user_id), 'exp': datetime.now(timezone.utc) + timedelta(days=7)}, JWT_SECRET, algorithm='HS256')

def current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail='Authentication required')
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=['HS256'])
        user = query('select id, email, full_name, timezone from users where id = %s', (payload['sub'],), one=True)
    except (jwt.PyJWTError, KeyError, ValueError):
        user = None
    if not user:
        raise HTTPException(status_code=401, detail='Invalid token')
    return user

class RegisterBody(BaseModel):
    email: str
    password: str = Field(min_length=4)
    full_name: str = Field(min_length=1)

class LoginBody(BaseModel):
    email: str
    password: str

class ForgotPasswordBody(BaseModel):
    email: str

class ResetPasswordBody(BaseModel):
    token: str = Field(min_length=20)
    new_password: str = Field(min_length=8)

class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

def reset_token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()

def ensure_password_reset_schema():
    query('''create table if not exists password_reset_tokens (
      id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
      token_hash text not null unique, expires_at timestamptz not null, used_at timestamptz,
      created_at timestamptz not null default now())''')
    query('create index if not exists password_reset_tokens_lookup_idx on password_reset_tokens(token_hash, expires_at) where used_at is null')

@app.on_event('startup')
def startup_schema():
    ensure_password_reset_schema()

def send_password_reset_email(email: str, token: str):
    if not all([SMTP_HOST, SMTP_FROM]):
        raise HTTPException(status_code=503, detail='Password reset email service is not configured')
    message = EmailMessage()
    message['Subject'] = 'OnTrack password reset'
    message['From'] = SMTP_FROM
    message['To'] = email
    message.set_content(f'Open this link to reset your OnTrack password: {APP_RESET_URL}?token={token}\nThis link expires in 30 minutes.')
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as client:
            if SMTP_STARTTLS:
                client.starttls()
            if SMTP_USERNAME and SMTP_PASSWORD:
                client.login(SMTP_USERNAME, SMTP_PASSWORD)
            client.send_message(message)
    except OSError as error:
        raise HTTPException(status_code=503, detail='Password reset email could not be delivered') from error

class DeadlineBody(BaseModel):
    title: str
    due_at: datetime
    description: str | None = None
    priority: str = 'MEDIUM'

class MilestoneBody(BaseModel):
    deadline_id: UUID
    title: str
    target_at: datetime
    description: str | None = None
    position: int = 0

class TaskBody(BaseModel):
    milestone_id: UUID
    title: str
    priority: str = 'MEDIUM'
    description: str | None = None
    position: int = 0

class SessionBody(BaseModel):
    task_id: UUID | None = None
    planned_start_at: datetime
    estimated_minutes: int = Field(gt=0)
    focus_mode: str = 'NORMAL'
    is_follow_up: bool = False
    previous_session_id: UUID | None = None

class ReviewBody(BaseModel):
    progress_after: float = Field(ge=0, le=100)
    actual_minutes: int = Field(ge=0)
    result_note: str | None = None

@app.get('/health')
def health():
    query('select 1')
    return {'status': 'ok', 'database': 'postgresql'}

@app.post('/api/v3/auth/register')
def register(body: RegisterBody):
    password_hash = bcrypt.hashpw(body.password.encode(), bcrypt.gensalt()).decode()
    try:
        user = query('insert into users(email,password_hash,full_name) values(%s,%s,%s) returning id,email,full_name,timezone', (body.email.lower(), password_hash, body.full_name), one=True)
    except psycopg.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail='Email already exists')
    return {'user': user, 'token': token_for(user['id'])}

@app.post('/api/v3/auth/login')
def login(body: LoginBody):
    user = query('select id,email,password_hash,full_name,timezone from users where email=%s', (body.email.lower(),), one=True)
    if not user or not bcrypt.checkpw(body.password.encode(), user['password_hash'].encode()):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    user.pop('password_hash', None)
    return {'user': user, 'token': token_for(user['id'])}

@app.post('/api/v3/auth/logout')
def logout(_: dict[str, Any] = Depends(current_user)):
    return {'ok': True}

@app.post('/api/v3/auth/forgot-password')
def forgot_password(body: ForgotPasswordBody):
    if not all([SMTP_HOST, SMTP_FROM]):
        raise HTTPException(status_code=503, detail='Password reset email service is not configured')
    user = query('select id,email from users where email=%s', (body.email.lower(),), one=True)
    if not user:
        return {'ok': True}
    token = secrets.token_urlsafe(32)
    try:
        query('insert into password_reset_tokens(user_id,token_hash,expires_at) values(%s,%s,%s)', (user['id'], reset_token_hash(token), datetime.now(timezone.utc) + timedelta(minutes=30)))
        send_password_reset_email(user['email'], token)
    except HTTPException:
        query('delete from password_reset_tokens where token_hash=%s', (reset_token_hash(token),))
        raise
    return {'ok': True}

@app.post('/api/v3/auth/reset-password')
def reset_password(body: ResetPasswordBody):
    with db() as conn:
        with conn.cursor() as cur:
            cur.execute('select id,user_id from password_reset_tokens where token_hash=%s and used_at is null and expires_at > now() for update', (reset_token_hash(body.token),))
            reset = cur.fetchone()
            if not reset:
                raise HTTPException(status_code=400, detail='Invalid or expired password reset token')
            password_hash = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
            cur.execute('update users set password_hash=%s, updated_at=now() where id=%s', (password_hash, reset['user_id']))
            cur.execute('update password_reset_tokens set used_at=now() where id=%s', (reset['id'],))
        conn.commit()
    return {'ok': True}

@app.post('/api/v3/auth/change-password')
def change_password(body: ChangePasswordBody, user: dict[str, Any] = Depends(current_user)):
    record = query('select password_hash from users where id=%s', (user['id'],), one=True)
    if not record or not bcrypt.checkpw(body.current_password.encode(), record['password_hash'].encode()):
        raise HTTPException(status_code=400, detail='Your current password is incorrect')
    if body.current_password == body.new_password:
        raise HTTPException(status_code=400, detail='The new password must be different from the current one')
    password_hash = bcrypt.hashpw(body.new_password.encode(), bcrypt.gensalt()).decode()
    query('update users set password_hash=%s, updated_at=now() where id=%s', (password_hash, user['id']))
    return {'ok': True}

@app.get('/api/v3/users/me')
def profile(user: dict[str, Any] = Depends(current_user)):
    return user

@app.put('/api/v3/users/me')
def update_profile(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)):
    full_name = body.get('full_name', user['full_name'])
    timezone_name = body.get('timezone', user['timezone'])
    return query('update users set full_name=%s, timezone=%s, updated_at=now() where id=%s returning id,email,full_name,timezone', (full_name, timezone_name, user['id']), one=True)

def expected_progress_for(due_at: datetime, now: datetime) -> float:
    """Straight-line pace: a deadline is expected to gain 2% per remaining day."""
    return max(0, min(100, 100 - max(0, (due_at - now).total_seconds() / 86400) * 2))

def risk_for(due_at: datetime, progress: Any, now: datetime) -> dict[str, Any]:
    """Single source of truth for risk. `deadlines.risk_level` is never written, so it
    must be derived on read or every list would report ON_TRACK forever."""
    value = float(progress or 0)
    expected = expected_progress_for(due_at, now)
    gap = value - expected
    if value >= 100:
        level = 'ON_TRACK'
    elif due_at < now:
        level = 'OVERDUE'
    elif gap < -10:
        level = 'AT_RISK'
    else:
        level = 'ON_TRACK'
    return {'expected_progress': expected, 'gap': gap, 'risk_level': level}

def status_for(due_at: datetime, progress: Any, risk_level: str) -> str:
    value = float(progress or 0)
    if value >= 100: return 'COMPLETED'
    if risk_level == 'OVERDUE': return 'OVERDUE'
    if risk_level == 'AT_RISK': return 'AT_RISK'
    return 'IN_PROGRESS' if value > 0 else 'PLANNING'

def with_derived_state(deadline: dict[str, Any], now: datetime) -> dict[str, Any]:
    risk = risk_for(deadline['due_at'], deadline['progress'], now)
    return {**deadline, 'risk_level': risk['risk_level'], 'status': status_for(deadline['due_at'], deadline['progress'], risk['risk_level']),
            'expected_progress': risk['expected_progress'], 'gap': risk['gap']}

@app.get('/api/v3/deadlines')
def list_deadlines(user: dict[str, Any] = Depends(current_user)):
    now = datetime.now(timezone.utc)
    rows = query('select id,title,description,due_at,priority,status,progress,risk_level from deadlines where user_id=%s order by due_at', (user['id'],))
    return [with_derived_state(row, now) for row in rows]

@app.post('/api/v3/deadlines')
def create_deadline(body: DeadlineBody, user: dict[str, Any] = Depends(current_user)):
    return query('insert into deadlines(user_id,title,description,due_at,priority) values(%s,%s,%s,%s,%s) returning *', (user['id'], body.title, body.description, body.due_at, body.priority), one=True)

@app.get('/api/v3/deadlines/{deadline_id}')
def get_deadline(deadline_id: UUID, user: dict[str, Any] = Depends(current_user)):
    deadline = query('select * from deadlines where id=%s and user_id=%s', (deadline_id, user['id']), one=True)
    if not deadline: raise HTTPException(404, 'Deadline not found')
    deadline = with_derived_state(deadline, datetime.now(timezone.utc))
    deadline['milestones'] = query('select * from milestones where deadline_id=%s order by position, created_at', (deadline_id,))
    for milestone in deadline['milestones']:
        milestone['tasks'] = query('select * from tasks where milestone_id=%s order by position, created_at', (milestone['id'],))
    # Flat session list so the detail screen's Sessions tab does not need N+1 requests.
    deadline['sessions'] = query(
        'select s.*,t.title as task_title from sessions s join tasks t on t.id=s.task_id '
        'join milestones m on m.id=t.milestone_id where m.deadline_id=%s order by s.planned_start_at desc',
        (deadline_id,))
    return deadline

@app.put('/api/v3/deadlines/{deadline_id}')
def update_deadline(deadline_id: UUID, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)):
    return query('update deadlines set title=coalesce(%s,title), description=coalesce(%s,description), due_at=coalesce(%s,due_at), priority=coalesce(%s,priority), updated_at=now() where id=%s and user_id=%s returning *', (body.get('title'), body.get('description'), body.get('due_at'), body.get('priority'), deadline_id, user['id']), one=True)

@app.delete('/api/v3/deadlines/{deadline_id}')
def delete_deadline(deadline_id: UUID, user: dict[str, Any] = Depends(current_user)):
    query('delete from deadlines where id=%s and user_id=%s', (deadline_id, user['id']))
    return {'ok': True}

def owned_milestone(milestone_id: UUID, user_id: UUID):
    return query('select m.* from milestones m join deadlines d on d.id=m.deadline_id where m.id=%s and d.user_id=%s', (milestone_id, user_id), one=True)

@app.post('/api/v3/milestones')
def create_milestone(body: MilestoneBody, user: dict[str, Any] = Depends(current_user)):
    if not query('select 1 from deadlines where id=%s and user_id=%s', (body.deadline_id, user['id']), one=True): raise HTTPException(404, 'Deadline not found')
    return query('insert into milestones(deadline_id,title,description,target_at,position) values(%s,%s,%s,%s,%s) returning *', (body.deadline_id, body.title, body.description, body.target_at, body.position), one=True)

@app.get('/api/v3/milestones/{milestone_id}')
def get_milestone(milestone_id: UUID, user: dict[str, Any] = Depends(current_user)):
    milestone = owned_milestone(milestone_id, user['id'])
    if not milestone: raise HTTPException(404, 'Milestone not found')
    milestone['tasks'] = query('select * from tasks where milestone_id=%s order by position, created_at', (milestone_id,))
    return milestone

@app.put('/api/v3/milestones/{milestone_id}')
def update_milestone(milestone_id: UUID, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)):
    if not owned_milestone(milestone_id, user['id']): raise HTTPException(404, 'Milestone not found')
    return query('update milestones set title=coalesce(%s,title), description=coalesce(%s,description), target_at=coalesce(%s,target_at), position=coalesce(%s,position), updated_at=now() where id=%s returning *', (body.get('title'), body.get('description'), body.get('target_at'), body.get('position'), milestone_id), one=True)

@app.delete('/api/v3/milestones/{milestone_id}')
def delete_milestone(milestone_id: UUID, user: dict[str, Any] = Depends(current_user)):
    if not owned_milestone(milestone_id, user['id']): raise HTTPException(404, 'Milestone not found')
    query('delete from milestones where id=%s', (milestone_id,))
    return {'ok': True}

@app.post('/api/v3/tasks')
def create_task(body: TaskBody, user: dict[str, Any] = Depends(current_user)):
    if not query('select 1 from milestones m join deadlines d on d.id=m.deadline_id where m.id=%s and d.user_id=%s', (body.milestone_id, user['id']), one=True): raise HTTPException(404, 'Milestone not found')
    return query('insert into tasks(milestone_id,title,description,priority,position) values(%s,%s,%s,%s,%s) returning *', (body.milestone_id, body.title, body.description, body.priority, body.position), one=True)

@app.get('/api/v3/tasks')
def list_tasks(include_completed: bool = False, user: dict[str, Any] = Depends(current_user)):
    """Every task the user owns, newest deadline first — used by the session task picker."""
    sql = ('select t.*, m.title as milestone_title, d.id as deadline_id, d.title as deadline_title '
           'from tasks t join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id '
           'where d.user_id=%s')
    if not include_completed:
        sql += " and t.current_progress < 100"
    return query(sql + ' order by d.due_at, m.position, m.created_at, t.position, t.created_at', (user['id'],))

@app.get('/api/v3/tasks/{task_id}')
def get_task(task_id: UUID, user: dict[str, Any] = Depends(current_user)):
    task = query('select t.*,m.title as milestone_title,m.deadline_id from tasks t join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where t.id=%s and d.user_id=%s', (task_id, user['id']), one=True)
    if not task: raise HTTPException(404, 'Task not found')
    task['sessions'] = query('select * from sessions where task_id=%s order by created_at desc', (task_id,))
    return task

@app.put('/api/v3/tasks/{task_id}')
def update_task(task_id: UUID, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)):
    return query('update tasks t set title=coalesce(%s,t.title), description=coalesce(%s,t.description), priority=coalesce(%s,t.priority), position=coalesce(%s,t.position), updated_at=now() from milestones m, deadlines d where t.milestone_id=m.id and m.deadline_id=d.id and t.id=%s and d.user_id=%s returning t.*', (body.get('title'), body.get('description'), body.get('priority'), body.get('position'), task_id, user['id']), one=True)

@app.delete('/api/v3/tasks/{task_id}')
def delete_task(task_id: UUID, user: dict[str, Any] = Depends(current_user)):
    query('delete from tasks t using milestones m, deadlines d where t.milestone_id=m.id and m.deadline_id=d.id and t.id=%s and d.user_id=%s', (task_id, user['id']))
    return {'ok': True}

@app.post('/api/v3/sessions')
def create_session(body: SessionBody, user: dict[str, Any] = Depends(current_user)):
    task_id = body.task_id
    if body.is_follow_up and body.previous_session_id:
        previous = owned_session(body.previous_session_id, user['id'])
        if not previous: raise HTTPException(404, 'Previous session not found')
        task_id = previous['task_id']
    task = query('select t.* from tasks t join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where t.id=%s and d.user_id=%s', (task_id, user['id']), one=True) if task_id else None
    if not task: raise HTTPException(404, 'Task not found')
    if body.is_follow_up and task['current_progress'] >= 100: raise HTTPException(400, 'Cannot create follow-up for completed task')
    return query('insert into sessions(task_id,planned_start_at,estimated_minutes,focus_mode,is_follow_up,previous_session_id,progress_before) values(%s,%s,%s,%s,%s,%s,%s) returning *', (task_id, body.planned_start_at, body.estimated_minutes, body.focus_mode, body.is_follow_up, body.previous_session_id, task['current_progress']), one=True)

def owned_session(session_id: UUID, user_id: UUID):
    return query('select s.*,t.title as task_title,t.current_progress as task_progress from sessions s join tasks t on t.id=s.task_id join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where s.id=%s and d.user_id=%s', (session_id, user_id), one=True)

@app.get('/api/v3/sessions/history')
def session_history(user: dict[str, Any] = Depends(current_user)):
    return query('select s.*,t.title as task_title from sessions s join tasks t on t.id=s.task_id join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where d.user_id=%s and s.status in (\'COMPLETED\',\'ENDED_EARLY\',\'SKIPPED\') order by s.ended_at desc', (user['id'],))

@app.get('/api/v3/sessions/{session_id}')
def get_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    session = owned_session(session_id, user['id'])
    if not session: raise HTTPException(404, 'Session not found')
    return session

@app.put('/api/v3/sessions/{session_id}')
def update_session(session_id: UUID, body: dict[str, Any], user: dict[str, Any] = Depends(current_user)):
    if not owned_session(session_id, user['id']): raise HTTPException(404, 'Session not found')
    return query('update sessions set planned_start_at=coalesce(%s,planned_start_at) where id=%s returning *', (body.get('planned_start_at'), session_id), one=True)

@app.delete('/api/v3/sessions/{session_id}')
def cancel_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    if not owned_session(session_id, user['id']): raise HTTPException(404, 'Session not found')
    return query('update sessions set status=\'CANCELLED\' where id=%s returning *', (session_id,), one=True)

@app.post('/api/v3/sessions/{session_id}/start')
def start_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    s = owned_session(session_id, user['id'])
    if not s: raise HTTPException(404, 'Session not found')
    if s['status'] != 'PLANNED': raise HTTPException(400, 'Only PLANNED sessions can start')
    started = datetime.now(timezone.utc); expected = started + timedelta(minutes=s['estimated_minutes'])
    query('update sessions set status=%s,started_at=%s,expected_end_at=%s where id=%s', ('IN_PROGRESS', started, expected, session_id))
    return owned_session(session_id, user['id'])

@app.post('/api/v3/sessions/{session_id}/pause')
def pause_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    if not (s := owned_session(session_id, user['id'])): raise HTTPException(404, 'Session not found')
    if s['status'] != 'IN_PROGRESS': raise HTTPException(400, 'Only IN_PROGRESS sessions can pause')
    query('update sessions set status=%s,paused_at=now() where id=%s', ('PAUSED', session_id))
    return owned_session(session_id, user['id'])

@app.post('/api/v3/sessions/{session_id}/resume')
def resume_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    if not (s := owned_session(session_id, user['id'])): raise HTTPException(404, 'Session not found')
    if s['status'] != 'PAUSED': raise HTTPException(400, 'Only PAUSED sessions can resume')
    # Give back the time that was left when the session was paused, not a fresh full duration.
    query('update sessions set status=%s,expected_end_at=now() + coalesce(greatest(expected_end_at - paused_at, interval \'0\'), estimated_minutes * interval \'1 minute\') where id=%s', ('IN_PROGRESS', session_id))
    return owned_session(session_id, user['id'])

@app.post('/api/v3/sessions/{session_id}/end')
def end_session(session_id: UUID, ended_early: bool = True, user: dict[str, Any] = Depends(current_user)):
    if not (s := owned_session(session_id, user['id'])): raise HTTPException(404, 'Session not found')
    if s['status'] not in ('IN_PROGRESS', 'PAUSED'): raise HTTPException(400, 'Only active sessions can end')
    query('update sessions set status=%s,ended_at=now(),actual_minutes=coalesce(actual_minutes,estimated_minutes) where id=%s', ('ENDED_EARLY' if ended_early else 'COMPLETED', session_id))
    return owned_session(session_id, user['id'])

@app.post('/api/v3/sessions/{session_id}/review')
def review_session(session_id: UUID, body: ReviewBody, user: dict[str, Any] = Depends(current_user)):
    s = owned_session(session_id, user['id'])
    if not s: raise HTTPException(404, 'Session not found')
    if s['status'] not in ('COMPLETED', 'ENDED_EARLY'): raise HTTPException(400, 'Session must be ended before review')
    if body.progress_after < float(s['progress_before']): raise HTTPException(400, 'progress_after cannot be lower than progress_before')
    with db() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute('update sessions set progress_after=%s,actual_minutes=%s,result_note=%s where id=%s returning *', (body.progress_after, body.actual_minutes, body.result_note, session_id)); session = cur.fetchone()
            cur.execute('update tasks set current_progress=%s,status=%s where id=%s returning *', (body.progress_after, 'COMPLETED' if body.progress_after == 100 else 'IN_PROGRESS' if body.progress_after > 0 else 'NOT_STARTED', s['task_id'])); task = cur.fetchone()
            cur.execute('select milestone_id from tasks where id=%s', (s['task_id'],)); milestone_id = cur.fetchone()['milestone_id']
            cur.execute('update milestones set progress=(select coalesce(avg(current_progress),0) from tasks where milestone_id=%s), status=case when (select coalesce(avg(current_progress),0) from tasks where milestone_id=%s)=100 then \'COMPLETED\' when (select coalesce(avg(current_progress),0) from tasks where milestone_id=%s)>0 then \'IN_PROGRESS\' else \'NOT_STARTED\' end where id=%s returning *', (milestone_id, milestone_id, milestone_id, milestone_id)); milestone = cur.fetchone()
            cur.execute('update deadlines set progress=(select coalesce(avg(progress),0) from milestones where deadline_id=%s) where id=%s returning *', (milestone['deadline_id'], milestone['deadline_id'])); deadline = cur.fetchone()
        conn.commit()
    return {'session': session, 'task': task, 'milestone': milestone, 'deadline': deadline, 'can_create_follow_up': body.progress_after < 100}

@app.get('/api/v3/dashboard/today')
def today(user: dict[str, Any] = Depends(current_user)):
    sessions = query('select s.*,t.title as task_title from sessions s join tasks t on t.id=s.task_id join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where d.user_id=%s and s.planned_start_at::date=current_date order by s.planned_start_at', (user['id'],))
    actionable = [session for session in sessions if session['status'] in ('PLANNED', 'IN_PROGRESS', 'PAUSED')]
    next_session = actionable[0] if actionable else None
    risk_rows = query('select id,title,due_at,progress,risk_level from deadlines where user_id=%s and progress < 100 order by due_at', (user['id'],))
    now = datetime.now(timezone.utc)
    risk = None
    for candidate in risk_rows:
        computed = risk_for(candidate['due_at'], candidate['progress'], now)
        if computed['risk_level'] in ('AT_RISK', 'OVERDUE'):
            risk = {**candidate, **computed}
            break
    risk_card = None
    if risk:
        risk_card = {
            'deadline_id': risk['id'],
            'title': risk['title'],
            'progress': risk['progress'],
            'risk_level': risk['risk_level'],
            'expected_progress': risk['expected_progress'],
            'gap': risk['gap'],
            'message': 'Deadline needs attention',
        }
    return {'sessions': sessions, 'next_session': next_session, 'risk_card': risk_card}

@app.get('/api/v3/deadlines/{deadline_id}/risk')
def deadline_risk(deadline_id: UUID, user: dict[str, Any] = Depends(current_user)):
    deadline = query('select * from deadlines where id=%s and user_id=%s', (deadline_id, user['id']), one=True)
    if not deadline: raise HTTPException(404, 'Deadline not found')
    computed = risk_for(deadline['due_at'], deadline['progress'], datetime.now(timezone.utc))
    return {'deadline_id': deadline_id, 'title': deadline['title'], 'due_at': deadline['due_at'], 'actual_progress': deadline['progress'],
            'expected_progress': computed['expected_progress'], 'gap': computed['gap'], 'risk_level': computed['risk_level'],
            'next_action': 'Complete the next planned task' if computed['risk_level'] != 'ON_TRACK' else 'Keep the planned schedule'}
