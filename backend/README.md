# OnTrack FastAPI backend

```powershell
# Start PostgreSQL from the repository root
docker compose up -d postgres

# Install and run FastAPI
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/ontrack'
uvicorn app.main:app --reload --port 8000
```

## Password-reset email test (local)

```powershell
docker compose up -d mailpit
$env:SMTP_HOST='127.0.0.1'
$env:SMTP_PORT='1025'
$env:SMTP_STARTTLS='false'
$env:SMTP_FROM='no-reply@ontrack.local'
$env:APP_RESET_URL='http://localhost:8081/reset-password'
python -m uvicorn app.main:app --port 8000
```

Mailpit inbox: `http://localhost:8025`.

Swagger: `http://localhost:8000/docs`
