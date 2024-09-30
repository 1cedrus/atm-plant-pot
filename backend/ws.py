from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter
from typing import List, Dict

router = APIRouter()

# Lưu trữ danh sách các kết nối WebSocket
# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: List[WebSocket] = []
#
#     async def connect(self, websocket: WebSocket):
#         await websocket.accept()
#         self.active_connections.append(websocket)
#
#     def disconnect(self, websocket: WebSocket):
#         self.active_connections.remove(websocket)
#
#     async def send_personal_message(self, message: str, websocket: WebSocket):
#         await websocket.send_text(message)
#
#     async def broadcast(self, message: str):
#         for connection in self.active_connections:
#             await connection.send_text(message)

# manager = ConnectionManager()

# @router.websocket("/ws/{client_id}")
# async def websocket_endpoint(websocket: WebSocket, client_id: str):
#     await manager.connect(websocket)
#     try:
#         while True:
#             data = await websocket.receive_text()
#             await manager.send_personal_message(f"You wrote: {data}", websocket)
#             await manager.broadcast(f"Client {client_id} says: {data}")
#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         await manager.broadcast(f"Client {client_id} left the chat")



class GroupConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, group_name: str):
        await websocket.accept()
        if group_name in self.active_connections:
            self.active_connections[group_name].append(websocket)
        else:
            self.active_connections[group_name] = [websocket]

    def disconnect(self, websocket: WebSocket, group_name: str):
        self.active_connections[group_name].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str, group_name: str):
        for connection in self.active_connections[group_name]:
            await connection.send_text(message)

manager_group = GroupConnectionManager()


@router.websocket("/ws/{client_id}/{group_name}")
async def websocket_ep(websocket: WebSocket, client_id: str, group_name: str):
    await manager_group.connect(websocket, group_name)
    try:
        while True:
            data = await websocket.receive_text()
            await manager_group.send_personal_message(f"You wrote: {data}", websocket)
            await manager_group.broadcast(f"Client {client_id} says: {data}", group_name)
    except WebSocketDisconnect:
        manager_group.disconnect(websocket, group_name)
        await manager_group.broadcast(f"Client {client_id} left the chat", group_name)
