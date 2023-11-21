import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, Rooms, ServerToClientEvents } from "./types/socketModels";
import * as RandomString from "randomstring";


/* 起動設定 */
// socket.ioのcors設定
const socketOptions = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
};

// socket.ioのServerインスタンス
const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, socketOptions);

// ルーム情報を格納するオブジェクト
const rooms: Rooms = {};


// コネクション確立
io.on("connection", (socket) => {
    // クライアントの接続をログに出力
    console.log(`connected by ${socket.id}`);

    // メッセージイベントを受信
    socket.on("sendMessage", (message) => {
        // クライアントから受け取ったメッセージを、クライアント全体に送信
        getMessageFromClient(message);
    });

    /* ルーム関係 */
    // ルームIDを取得する際に呼ばれる関数
    socket.on("getRooms", () => {
        const roomIdList: string[] = Object.keys(rooms);
        socket.emit("getRooms", roomIdList);
    })

    // ユーザーが新しいルームを作成する際に呼ばれる関数
    socket.on("createRoom", () => {
        const roomId: string = generateUniqueRoomId();
        rooms[roomId] = [socket.id];
        socket.join(roomId);
        socket.emit("roomCreated", roomId);
    });

    // ユーザーが既存のルームに参加する際に呼ばれる関数
    socket.on("joinRoom", (roomId) => {
        if(rooms[roomId]){
            rooms[roomId].push(socket.id);
            socket.join(roomId);
            io.to(roomId).emit("userJoined", socket.id);
        }else{
            socket.emit("roomNotFound");
        }
    });

    // ユーザーがルームから退出する際に呼ばれる関数
    socket.on("leaveRoom", (roomId) => {
        leaveRoom(roomId);
    })


    // 切断イベント受信
    socket.on("disconnect", (reason) => {
        console.log(`user disconnected. reason is ${reason}.`);

        // ユーザーが接続を切った場合、どのルームからも退出する
        for(const roomId in rooms){
            if(rooms[roomId].includes(socket.id)){
                leaveRoom(roomId);
            }
        }
    });


    /* socket内関数定義 */
    // クライアントからメッセージを受け取った際の処理
    function getMessageFromClient(message: string){
        console.log(`${socket.id}: ${message}`); // クライアントから受け取ったメッセージをログに出力

        // クライアントから受け取ったメッセージを、クライアント全体に送信
        const newMessage: string = `${socket.id}: ${message}`;
        socket.broadcast.emit("responseMessage", newMessage);
    };

    // ルームから退出する際の処理
    function leaveRoom(roomId: string): void{
        if(rooms[roomId]){
            const index = rooms[roomId].indexOf(socket.id); // ルーム配列内のユーザーIDのindex

            // ルーム配列内にユーザーIDが存在する場合、退出処理を行う
            if(index !== -1){
                rooms[roomId].splice(index, 1); // ルームオブジェクトからユーザーIDを削除する
                socket.leave(roomId); // ルームから退出する
                io.to(roomId).emit("userLeft", socket.id);

                // ルームが空になったら削除
                if(rooms[roomId].length === 0){
                    delete rooms[roomId];
                    socket.emit("roomRemoved", roomId);
                }
            }
        }
    }
});


/* 関数定義 */
// 一意なルームIDを生成する関数
function generateUniqueRoomId(): string{
    // ランダムな文字列を作成する
    let roomId: string = generateRandomId();

    // 重複チェック
    while(rooms[roomId]){
        roomId = generateRandomId();
    }

    return roomId;
}

// ランダムな文字列を生成する関数
function generateRandomId(length: number = 5): string{
    const randomString: string = RandomString.generate({
        length,
        charset: 'alphabetic'
    });
    return randomString;
}


// サーバーを3000番ポートで起動
httpServer.listen(3000, () => {
    console.log("Server start on port 3000.");
});