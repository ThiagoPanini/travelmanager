import logging
from typing import Annotated

from fastapi import Depends, FastAPI, Response
from sqlalchemy import Engine

from travelmanager.identity import router as auth_router
from travelmanager.shared.db import database_ready, get_engine_dep
from travelmanager.shared.errors import install_error_handlers
from travelmanager.trips import router as trips_router

# O uvicorn só configura seus próprios loggers; o namespace travelmanager ficaria
# mudo em runtime (INFO silenciado pelo WARNING do root). Adicionamos um handler
# próprio para que logs de app (ex.: OTP dev) apareçam no terminal.
_tl = logging.getLogger("travelmanager")
_tl.setLevel(logging.INFO)
if not _tl.handlers:
    _h = logging.StreamHandler()
    _h.setFormatter(logging.Formatter("%(levelname)s:%(name)s: %(message)s"))
    _tl.addHandler(_h)
    _tl.propagate = False

app = FastAPI(title="travel·manager API")

install_error_handlers(app)
app.include_router(auth_router)
app.include_router(trips_router)


@app.get("/health")
def health() -> dict[str, str]:
    """Liveness: responde sem depender de banco (smoke do deploy faz grep por "status")."""
    return {"status": "ok"}


@app.get("/health/ready")
def ready(
    response: Response,
    engine: Annotated[Engine | None, Depends(get_engine_dep)],
) -> dict[str, str]:
    """Readiness: confirma conectividade com o banco; 503 quando indisponível."""
    if database_ready(engine):
        return {"status": "ok", "database": "up"}
    response.status_code = 503
    return {"status": "error", "database": "down"}
