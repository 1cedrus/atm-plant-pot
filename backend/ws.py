from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter, Depends
from typing import List, Dict
from database.database import get_db_other
from models.models import MoistureReading, WaterLevel, Weather, Config
from utils import pin_authenticate

router = APIRouter()


def get_lastest_data():
    with get_db_other() as db:
        response = {}
        moisure = db.query(MoistureReading).order_by(MoistureReading.timestamp.desc()).first()
        response["moisture"] = moisure.moisture_level if moisure else None
        water_level = db.query(WaterLevel).order_by(WaterLevel.timestamp.desc()).first()
        response["water_level"] = water_level.water_level if water_level else None
        weather = db.query(Weather).order_by(Weather.datetime.desc()).first()
        response["weather"] = weather.to_dict() if weather else None
        return response

# Lưu trữ danh sách các kết nối WebSocket
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        await self.send_personal_json_message(get_lastest_data(), websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_personal_json_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    async def broadcast_json(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            # data = await websocket.receive_text()
            # await manager.send_personal_message(f"You wrote: {data}", websocket)
            # await manager.broadcast(f"Client {client_id} says: {data}")
            djson = await websocket.receive_json()
            # await manager.send_personal_json_message(djson, websocket)
            await manager.broadcast_json(djson)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # await manager.broadcast(f"Client {client_id} left the chat")



# class GroupConnectionManager:
#     def __init__(self):
#         self.active_connections: Dict[str, List[WebSocket]] = {}
#
#     async def connect(self, websocket: WebSocket, group_name: str):
#         await websocket.accept()
#         if group_name in self.active_connections:
#             self.active_connections[group_name].append(websocket)
#         else:
#             self.active_connections[group_name] = [websocket]
#
#     def disconnect(self, websocket: WebSocket, group_name: str):
#         self.active_connections[group_name].remove(websocket)
#
#     async def send_personal_message(self, message: str, websocket: WebSocket):
#         await websocket.send_text(message)
#
#     async def broadcast(self, message: str, group_name: str):
#         for connection in self.active_connections[group_name]:
#             await connection.send_text(message)
#
# manager_group = GroupConnectionManager()

#
# @router.websocket("/ws/{client_id}/{group_name}")
# async def websocket_ep(websocket: WebSocket, client_id: str, group_name: str):
#     await manager_group.connect(websocket, group_name)
#     try:
#         while True:
#             data = await websocket.receive_text()
#             await manager_group.send_personal_message(f"You wrote: {data}", websocket)
#             await manager_group.broadcast(f"Client {client_id} says: {data}", group_name)
#     except WebSocketDisconnect:
#         manager_group.disconnect(websocket, group_name)
#         await manager_group.broadcast(f"Client {client_id} left the chat", group_name)
