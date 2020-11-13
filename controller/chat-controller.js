class ChatController {
    _chat_client

    constructor(chat_client) {
        this._chat_client = chat_client;
        this.load();
    }

    sendMessageHandler() {
        let message = document.getElementById("chatSendInput").value
        this._chat_client.sendMessage(message);
    }

    load() {
        
        document.getElementById("submitmsg").addEventListener("click", () => {
            this.sendMessageHandler();
        });
    };
    
};