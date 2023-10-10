import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "./types/socketModels";

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
    console.log(`connected by ${socket.id}`);

    // イベント発行
    socket.emit("hello", "from server");

    // イベント受信
    socket.on("message", (message) => {
        console.log(`from client: ${message}`);
    });

  // 切断イベント受信
    socket.on("disconnect", (reason) => {
        console.log(`user disconnected. reason is ${reason}.`);
    });
});

// サーバーを3000番ポートで起動
httpServer.listen(3000, () => {
    console.log("Server start on port 3000.");
});