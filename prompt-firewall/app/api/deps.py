from typing import Annotated
from fastapi import Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session
from app.db.repositories.requests_repo import RequestsRepo
from app.db.repositories.channels_repo import ChannelsRepo
from app.db.repositories.detections_repo import DetectionsRepo
from app.scanners.registry import ScannerRegistry
from app.scanners.engine import ScanEngine
from app.services.normalizer import NormalizerService
from app.services.policy_engine import PolicyEngine
from app.services.persistence_service import PersistenceService
from app.services.scan_orchestrator import ScanOrchestrator
from app.services.chunking_service import ChunkingService
from app.services.document_service import DocumentService
from app.services.url_service import UrlService
from app.db.repositories.documents_repo import DocumentsRepo
from app.db.repositories.document_chunks_repo import DocumentChunksRepo
from app.db.repositories.url_sources_repo import UrlSourcesRepo
from app.db.repositories.url_chunks_repo import UrlChunksRepo
from app.services.event_service import EventService

def get_registry(request: Request) -> ScannerRegistry:
    return request.app.state.scanner_registry

def get_scan_engine(request: Request) -> ScanEngine:
    return request.app.state.scan_engine

def get_normalizer(request: Request) -> NormalizerService:
    return request.app.state.normalizer

def get_policy_engine(request: Request) -> PolicyEngine:
    return request.app.state.policy_engine

def get_persistence_service(session: Annotated[AsyncSession, Depends(get_db_session)]) -> PersistenceService:
    return PersistenceService(
        RequestsRepo(session),
        ChannelsRepo(session),
        DetectionsRepo(session)
    )

def get_orchestrator(
    normalizer: Annotated[NormalizerService, Depends(get_normalizer)],
    scan_engine: Annotated[ScanEngine, Depends(get_scan_engine)],
    policy_engine: Annotated[PolicyEngine, Depends(get_policy_engine)],
    persistence: Annotated[PersistenceService, Depends(get_persistence_service)],
) -> ScanOrchestrator:
    return ScanOrchestrator(normalizer, scan_engine, policy_engine, persistence)

def get_readiness_service(request: Request):
    return request.app.state.readiness_service

def get_event_service(request: Request) -> EventService:
    return request.app.state.event_service

def get_chunking_service() -> ChunkingService:
    return ChunkingService()

def get_document_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
    chunker: Annotated[ChunkingService, Depends(get_chunking_service)],
    scan_engine: Annotated[ScanEngine, Depends(get_scan_engine)],
    event_service: Annotated[EventService, Depends(get_event_service)]
) -> DocumentService:
    return DocumentService(
        documents_repo=DocumentsRepo(session),
        document_chunks_repo=DocumentChunksRepo(session),
        chunker=chunker,
        scan_engine=scan_engine,
        event_service=event_service
    )

def get_url_service(
    session: Annotated[AsyncSession, Depends(get_db_session)],
    chunker: Annotated[ChunkingService, Depends(get_chunking_service)],
    scan_engine: Annotated[ScanEngine, Depends(get_scan_engine)],
    event_service: Annotated[EventService, Depends(get_event_service)]
) -> UrlService:
    return UrlService(
        url_sources_repo=UrlSourcesRepo(session),
        url_chunks_repo=UrlChunksRepo(session),
        chunker=chunker,
        scan_engine=scan_engine,
        event_service=event_service
    )
