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

Swagger: `http://localhost:8000/docs`
