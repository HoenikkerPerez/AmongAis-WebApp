class ChatController {
    _chat_client
    _username
    _gamename

    constructor(chat_client) {
        this._chat_client = chat_client;
        this._chat_client.onMessage(async (evt) => {
            let msg = await evt.data.text();
            // let msg = evt.data;
            console.debug("Chat Client received message: " + msg);
            // <channel> <name> <text>
            let spltmsg = msg.split(" ")
            let channel = spltmsg.shift();
            let name = spltmsg.shift();
            let text = spltmsg.join(' ');;

            model.addMessageChat(channel, name, text);
            
            if(name.startsWith("@") && (channel == model.status.ga)) {
                this._parseSystemMessage(text);
            }
        });
        this.load();
    }

    _parseSystemMessage(msg) {
        if(msg == "Now starting!\n") {  // STARTED GAME
            model.setGameActive();
        } else if (msg.split(" ")[1] == "joined") { // JOINED PLAYER
            model.playerJoined(msg.split(" ")[0]);
        }           // TODO LEAVING PLAYER
        else if(msg.startsWith("EMERGENCY MEETING! Called by")){
            let msg_list = msg.split(" ");
            let who_call = msg_list[msg_list.length-1];
            model.meetingStart(who_call);
        }
    }

    _sendChatMessage() {
        let channel = document.getElementById("chatSendChannelInput").value
        let message = document.getElementById("chatSendMessageInput").value
        this._chat_client.sendMessage(channel, message);
        // update model
        // model.addMessageChat(channel, this._username, message);
    }
    
    _subscribeChatChannel() {
        let channel = document.getElementById("chatChannelInput").value
        this._chat_client.subscribeChannel(channel);
        //update model
        model.addSubscribedChannel(channel);
    }

    load() {
        document.getElementById("chatChannelInput").addEventListener("input", this._validateChannel);
        document.getElementById("chatChannelButton").addEventListener("click", () => {
            this._subscribeChatChannel();
        });

        document.getElementById("chatSendMessageInput").addEventListener("input", this._validateSend);
        document.getElementById("chatSendChannelInput").addEventListener("input", this._validateSend);
        document.getElementById("chatSendButton").addEventListener("click", () => {
            this._sendChatMessage();
            document.getElementById("chatSendMessageInput").value = "";
        });
        
        document.addEventListener("MODEL_RUN_GAME", () => {
            // JOIN chat with login name
            console.debug("chat-controller USERNAME SET")
            this._username = model.inGameName
            if (model.inGameName == undefined) {
                this._username = "spectator";
            } 
            this._chat_client.loginChat(this._username);

            // SUBSCRIBE to the game channel
            this._gamename = model.status.ga;
            this._chat_client.subscribeChannel(this._gamename);
            //update model
            model.addSubscribedChannel(this._gamename);
            document.getElementById("chatSendChannelInput").value = this._gamename;

            // set default channel

        }, false);

        document.addEventListener("BUTTON_UNSUBSRIBECHANNEL", (evt) => {
            let channel = evt.detail.channel;
            this._chat_client.leaveChannel(channel);
            popupMsg("Channel " + channel + " left", "success");
            model.removeSubscribedChannel(channel);
        });

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