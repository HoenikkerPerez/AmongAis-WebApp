class ChatController {
    _chat_client

    _parseChatMessage(item) {
        let trimmed = item.replace(/  +/g, ' ');
        let spltmsg = trimmed.split(" ");
        let channel = spltmsg.shift();
        let name = spltmsg.shift();
        let text = spltmsg.join(' ');

        return {
            channel: channel,
            name: name,
            text: text
        }
    }

    constructor(chat_client) {
        this._chat_client = chat_client;
        this._chat_client.onMessage(async (evt) => {
            let msg = await evt.data.text();
            // let msg = evt.data;
            let msgs = msg.split("\n");
            for(let i in msgs) {
                let item = msgs[i];
                if (item.length > 0) {
                    console.debug("Chat Client received message: " + msg);
                    // <channel> <name> <text>
                    let parsed = this._parseChatMessage(item);
                    let channel = parsed.channel;
                    let name = parsed.name;
                    let text = parsed.text;

                    if(name.startsWith("@") && (channel == model.status.ga)) {
                        let kind = this._parseSystemMessage(text, channel, name);
                        // Endgame ladder message: extract and compute the next #players messages
                        if(kind == "ladder") {
                            let playerNumber = Object.keys(model.status.pl_list).length;
                            let scoreMsgs = msgs.splice(i, playerNumber);
                            for(let j in scoreMsgs) {
                                let scoreMsg = scoreMsgs[j];
                                let text = this._parseChatMessage(scoreMsg).text;
                                this._parseLadderSystemMessage(text);
                            }
                        }
                    } else {
                        this._parseNonSystemMessage(text, channel, name);
                    }
                }
            }
        });
        this.load();
    }

    _parseSystemMessage(msg, channel, name) {

        let msgspl = msg.split(" "); // @gameserver ...

        // GAME start
        if(msg == "Now starting!") { 
            model.setGameActive();
            model.addMessageChat(channel, name, msg);
            return;
        }

        // GAME finish
        if (msg.startsWith("Game finished!")) {
            document.dispatchEvent(new CustomEvent("CHAT_GAME_FINISHED", {detail: {message:msg}}));
            model.addMessageChat(channel, name, msg);
            return;
        }

        // Endgame ladder multiline message
        if (msg.startsWith("(")) {
            return "ladder";
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
        if(msg.startsWith("EMERGENCY MEETING") && msg.endsWith("ended.")){
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

    _parseLadderSystemMessage(msg) {
        // Split message components
        let msgspl = msg.split(" "); // @gameserver ...
        // Player endgame messages
        let team = msgspl[0][1];
        let playerName = msgspl[1];
        let finalStatus = msgspl[2]; // ACTIVE, KILLED, ...
        let score = parseInt(msgspl[3]);
        let endscore = {score: score, team: team, name: playerName, endedAs: finalStatus};
        model.pushEndgameScore(endscore);
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
        // model.addMessageChat(channel, username, message);
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
            document.getElementById("canvas").focus();
        });

        document.getElementById("chatSendMessageInput").addEventListener("input", this._validateSend);
        document.getElementById("chatSendMessageInput").addEventListener("keyup", (evt) => {
            if(evt.key === 'Enter') {
                this._sendChatMessage();
                document.getElementById("chatSendMessageInput").value = "";
                this._validateSend();
                document.getElementById("canvas").focus();
            }});
        document.getElementById("chatSendChannelInput").addEventListener("input", this._validateSend);
        document.getElementById("chatSendButton").addEventListener("click", () => {
            this._sendChatMessage();
            document.getElementById("chatSendMessageInput").value = "";
            this._validateSend();
            document.getElementById("canvas").focus();
        });
        
        document.addEventListener("MODEL_RUN_GAME", () => {
            // JOIN chat with login name
            console.debug("chat-controller USERNAME SET")
            let username = model.inGameName
            this._chat_client.loginChat(username);

            // SUBSCRIBE to the game channel
            let gamename = model.status.ga;
            this._chat_client.subscribeChannel(gamename);
            //update model
            model.addSubscribedChannel(gamename);
            document.getElementById("chatSendChannelInput").value = gamename;

            // set default channel

        }, false);

        document.addEventListener("BUTTON_UNSUBSRIBECHANNEL", (evt) => {
            let channel = evt.detail.channel;
            this._chat_client.leaveChannel(channel);
            popupMsg("Channel " + channel + " left", "success");
            model.removeSubscribedChannel(channel);
            document.getElementById("canvas").focus();

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