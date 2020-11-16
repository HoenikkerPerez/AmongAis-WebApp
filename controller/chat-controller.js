class ChatController {
    _chat_client

    constructor(chat_client) {
        this._chat_client = chat_client;
        this._chat_client.onMessage((evt) => {
            let msg = evt.data;
            console.debug("Chat Client received message: " + msg);
            // <channel> <name> <text>
            let spltmsg = msg.split(" ")
            let channel = spltmsg.shift();
            let name = spltmsg.shift();
            let text = spltmsg.join(' ');;

            model.addMessageChat(channel, name, text);

        });
        this.load();
    }

    _loginChat() {
        let username = document.getElementById("chatLoginInput").value
        this._chat_client.loginChat(username);

        let block = document.getElementById("chatLoginBlock");
        block.parentNode.removeChild(block);
    }

    _sendChatMessage() {
        let channel = document.getElementById("chatSendChannelInput").value
        let message = document.getElementById("chatSendMessageInput").value
        this._chat_client.sendMessage(channel, message);
    }
    
    _subscribeChatChannel() {
        let channel = document.getElementById("chatChannelInput").value
        this._chat_client.sendMessage(channel);
    }

    load() {
        document.getElementById("chatLoginInput").addEventListener("input", this._validateLogin);
        document.getElementById("chatLoginButton").addEventListener("click", () => {
            this._loginChat();
        });

        document.getElementById("chatChannelInput").addEventListener("input", this._validateChannel);
        document.getElementById("chatChannelButton").addEventListener("click", () => {
            this._subscribeChatChannel();
        });

        document.getElementById("chatSendMessageInput").addEventListener("input", this._validateSend);
        document.getElementById("chatSendChannelInput").addEventListener("input", this._validateSend);
        document.getElementById("chatSendButton").addEventListener("click", () => {
            this._sendChatMessage();
        });

        document.addEventListener("MODEL_SETGAMEACTIVE", () => {
            // JOIN chat with login name
            let username = model.username
            this._chat_client.loginChat(username);
        }, false);



    };
    
    _validateLogin() {
        let inputValue = document.getElementById("chatLoginInput").value;
        let button = document.getElementById("chatLoginButton");
        if(inputValue.length == 0) {
            button.disabled = true
        } else {
            button.disabled = false
        }
    };

    _validateSend() {
        let channel = document.getElementById("chatSendChannelInput").value;
        let message = document.getElementById("chatSendMessageInput").value;
        let button = document.getElementById("chatSendButton");
        if(channel.length == 0 || message.length == 0) {
            button.disabled = true
        } else {
            button.disabled = false
        }
    };


    _validateChannel() {
        let inputValue = document.getElementById("chatChannelInput").value;
        let button = document.getElementById("chatChannelButton");
        if(inputValue.length == 0) {
            button.disabled = true
        } else {
            button.disabled = false
        }
    };

};