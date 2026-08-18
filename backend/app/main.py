from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
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

@app.get('/api/v3/users/me')
def profile(user: dict[str, Any] = Depends(current_user)):
    return user

@app.put('/api/v3/users/me')
def update_profile(body: dict[str, Any], user: dict[str, Any] = Depends(current_user)):
    full_name = body.get('full_name', user['full_name'])
    timezone_name = body.get('timezone', user['timezone'])
    return query('update users set full_name=%s, timezone=%s, updated_at=now() where id=%s returning id,email,full_name,timezone', (full_name, timezone_name, user['id']), one=True)

@app.get('/api/v3/deadlines')
def list_deadlines(user: dict[str, Any] = Depends(current_user)):
    return query('select id,title,description,due_at,priority,status,progress,risk_level from deadlines where user_id=%s order by due_at', (user['id'],))

@app.post('/api/v3/deadlines')
def create_deadline(body: DeadlineBody, user: dict[str, Any] = Depends(current_user)):
    return query('insert into deadlines(user_id,title,description,due_at,priority) values(%s,%s,%s,%s,%s) returning *', (user['id'], body.title, body.description, body.due_at, body.priority), one=True)

@app.get('/api/v3/deadlines/{deadline_id}')
def get_deadline(deadline_id: UUID, user: dict[str, Any] = Depends(current_user)):
    deadline = query('select * from deadlines where id=%s and user_id=%s', (deadline_id, user['id']), one=True)
    if not deadline: raise HTTPException(404, 'Deadline not found')
    deadline['milestones'] = query('select * from milestones where deadline_id=%s order by position', (deadline_id,))
    for milestone in deadline['milestones']:
        milestone['tasks'] = query('select * from tasks where milestone_id=%s order by position', (milestone['id'],))
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
    return query('select s.* from sessions s join tasks t on t.id=s.task_id join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where s.id=%s and d.user_id=%s', (session_id, user_id), one=True)

@app.get('/api/v3/sessions/{session_id}')
def get_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    session = owned_session(session_id, user['id'])
    if not session: raise HTTPException(404, 'Session not found')
    return session

@app.get('/api/v3/sessions/history')
def session_history(user: dict[str, Any] = Depends(current_user)):
    return query('select s.*,t.title as task_title from sessions s join tasks t on t.id=s.task_id join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where d.user_id=%s and s.status in (\'COMPLETED\',\'ENDED_EARLY\',\'SKIPPED\') order by s.ended_at desc', (user['id'],))

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
    return query('update sessions set status=%s,started_at=%s,expected_end_at=%s where id=%s returning *', ('IN_PROGRESS', started, expected, session_id), one=True)

@app.post('/api/v3/sessions/{session_id}/pause')
def pause_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    if not (s := owned_session(session_id, user['id'])): raise HTTPException(404, 'Session not found')
    if s['status'] != 'IN_PROGRESS': raise HTTPException(400, 'Only IN_PROGRESS sessions can pause')
    return query('update sessions set status=%s,paused_at=now() where id=%s returning *', ('PAUSED', session_id), one=True)

@app.post('/api/v3/sessions/{session_id}/resume')
def resume_session(session_id: UUID, user: dict[str, Any] = Depends(current_user)):
    if not (s := owned_session(session_id, user['id'])): raise HTTPException(404, 'Session not found')
    if s['status'] != 'PAUSED': raise HTTPException(400, 'Only PAUSED sessions can resume')
    return query('update sessions set status=%s,expected_end_at=now() + (estimated_minutes * interval \'1 minute\') where id=%s returning *', ('IN_PROGRESS', session_id), one=True)

@app.post('/api/v3/sessions/{session_id}/end')
def end_session(session_id: UUID, ended_early: bool = True, user: dict[str, Any] = Depends(current_user)):
    if not (s := owned_session(session_id, user['id'])): raise HTTPException(404, 'Session not found')
    if s['status'] not in ('IN_PROGRESS', 'PAUSED'): raise HTTPException(400, 'Only active sessions can end')
    return query('update sessions set status=%s,ended_at=now(),actual_minutes=coalesce(actual_minutes,estimated_minutes) where id=%s returning *', ('ENDED_EARLY' if ended_early else 'COMPLETED', session_id), one=True)

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
    return {'sessions': query('select s.*,t.title as task_title from sessions s join tasks t on t.id=s.task_id join milestones m on m.id=t.milestone_id join deadlines d on d.id=m.deadline_id where d.user_id=%s and s.planned_start_at::date=current_date order by s.planned_start_at', (user['id'],)), 'next_session': None, 'risk_card': None}

@app.get('/api/v3/deadlines/{deadline_id}/risk')
def deadline_risk(deadline_id: UUID, user: dict[str, Any] = Depends(current_user)):
    deadline = query('select * from deadlines where id=%s and user_id=%s', (deadline_id, user['id']), one=True)
    if not deadline: raise HTTPException(404, 'Deadline not found')
    expected = max(0, min(100, 100 - max(0, (deadline['due_at'] - datetime.now(timezone.utc)).total_seconds() / 86400) * 2))
    gap = float(deadline['progress']) - expected
    risk = 'OVERDUE' if deadline['due_at'] < datetime.now(timezone.utc) and float(deadline['progress']) < 100 else 'AT_RISK' if gap < -10 else 'ON_TRACK'
    return {'deadline_id': deadline_id, 'actual_progress': deadline['progress'], 'expected_progress': expected, 'gap': gap, 'risk_level': risk, 'next_action': 'Complete the next planned task' if risk != 'ON_TRACK' else 'Keep the planned schedule'}
