// イベントの送信およびブロードキャスト時に使用される型定義
export type ServerToClientEvents = {
    responseMessage(message: string): void;
    roomCreated(roomId: string): void;
    roomRemoved(roomId: string): void;
    userJoined(userId: string): void;
    roomNotFound(): void;
    userLeft(userId: string): void;
    getRooms(rooms: string[]): void;
}

// イベント受信時に使用する型定義
export type ClientToServerEvents = {
    sendMessage(message: string): void;
    createRoom(): void;
    joinRoom(roomId: string): void;
    leaveRoom(roomId: string): void;
    getRooms(): void;
};

// ルーム情報を管理するオブジェクト
export type Rooms = {
    [roomId: string]: string[];
};