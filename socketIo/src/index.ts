import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./types/socketModels";


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


// コネクション確立
io.on("connection", (socket) => {
    // クライアントの接続をログに出力
    console.log(`connected by ${socket.id}`);

    // メッセージイベントを受信
    socket.on("sendMessage", (message) => {
        // クライアントから受け取ったメッセージを、クライアント全体に送信
        getMessageFromClient(message);
    });

    // 切断イベント受信
    socket.on("disconnect", (reason) => {
        console.log(`user disconnected. reason is ${reason}.`);
    });


    /* 関数定義 */
    // クライアントからメッセージを受け取った際の処理
    function getMessageFromClient(message: string){
        console.log(`from client: ${message}`); // クライアントから受け取ったメッセージをログに出力

        // クライアントから受け取ったメッセージを、クライアント全体に送信
        const newMessage: string = `from ${socket.id}` + "\n" + message;
        socket.emit("responseMessage", newMessage);
    };
});


// サーバーを3000番ポートで起動
httpServer.listen(3000, () => {
    console.log("Server start on port 3000.");
});