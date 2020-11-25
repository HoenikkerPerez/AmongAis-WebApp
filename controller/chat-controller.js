class ChatController {
    _chat_client
    _username
    _gamename

    _isEndgame = false

    constructor(chat_client) {
        this._chat_client = chat_client;
        this._chat_client.onMessage(async (evt) => {
            let msg = await evt.data.text();
            // let msg = evt.data;
            let msgs = msg.split("\n");
            msgs.forEach((item, idx) => {
                if (item.length > 0) {
                    console.debug("Chat Client received message: " + msg);
                    // <channel> <name> <text>
                    let trimmed = item.replace(/  +/g, ' ');
                    let spltmsg = trimmed.split(" ");
                    let channel = spltmsg.shift();
                    let name = spltmsg.shift();
                    let text = spltmsg.join(' ');

                    if(name.startsWith("@") && (channel == model.status.ga)) {
                        this._parseSystemMessage(text, channel, name);
                    } else {
                        this._parseNonSystemMessage(text, channel, name);
                    }
                }
            });             
        });
        this.load();
    }

    _parseSystemMessage(msg, channel, name) {

        let msgspl = msg.split(" "); // @gameserver ...

        if(this._isEndgame) {
            // Player endgame messages
            let team = msgspl[0][1];
            let playerName = msgspl[1];
            let finalStatus = msgspl[2]; // ACTIVE, KILLED, ...
            let score = parseInt(msgspl[3]);
            let endscore = {score: score, team: team, name: playerName, endedAs: finalStatus};
            model.pushEndgameScore(endscore);
            return;
        }

        // GAME start
        if(msg == "Now starting!\n") { 
            model.setGameActive();
            model.addMessageChat(channel, name, msg);
            return;
        }

        // GAME finish
        if (msg.startsWith("Game finished!")) {
            document.dispatchEvent(new CustomEvent("CHAT_GAME_FINISHED", {detail: {message:msg}}));
            model.addMessageChat(channel, name, msg);
            this._isEndgame = true;
            return;
        }

        // JOIN
        if (msgspl[1] == "joined") { // JOINED PLAYER
            model.playerJoined(msgspl[0]);
            model.addMessageChat(channel, name, msg);
            return;
        }
        // SHOT
        if(msgspl[1]=="shot") {
            let playerName = msgspl[0];
            let direction = msgspl[2];
            let shootEvent = new CustomEvent("CHAT_SHOOT", {detail: { shooter: playerName, direction:  direction} });
            document.dispatchEvent(shootEvent);
            return;
        }
        
        // TODO LEAVING PLAYER

        // EMERGENCY MEETING start
        if(msg.startsWith("EMERGENCY MEETING! Called by")){
            let msg_list = msg.split(" ");
            let who_call = msg_list[msg_list.length-1];
            model.meetingStart(who_call);
            return;
        }
        // EMERGENCY MEETING ended.
        if(msg.startsWith("EMERGENCY MEETING ended.")){
            model.meetingEnd();
            return;
        }
        // ACCUSE
        if(msgspl[1]=="accuses"){
            model.accuseDone(msgspl[0],msgspl[2]);
            return;
        }
        //  Other EMERGENCY MEETING messages
        if(msg.startsWith("EMERGENCY MEETING")){
            model.meetingMSG(msg.slice(17));
            return;
        }

        model.addMessageChat(channel, name, msg);
    }

    _parseNonSystemMessage(msg, channel, name) {
        // Perhaps one day this function will grow and become powerful. But not today.
        model.addMessageChat(channel, name, msg);
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