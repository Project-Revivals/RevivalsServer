// イベントの送信およびブロードキャスト時に使用される型定義
export type ServerToClientEvents = {
    responseMessage: (message: string) => void;
};

// イベント受信時に使用する型定義
export type ClientToServerEvents = {
    sendMessage: (message: string) => void;
};