from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import ScanRequestModel

class RequestsRepo:
    def __init__(self, session: AsyncSession):
        self.session = session
        
    def add(self, request_data: dict) -> ScanRequestModel:
        model = ScanRequestModel(**request_data)
        self.session.add(model)
        return model
