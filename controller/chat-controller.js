class ChatController {
    _chat_client

    _listeners = [];

    _addChatListener(listeners, toWhat, tag, handler, consumes) {
        if(toWhat === document) {
            document.addEventListener(tag, handler, consumes);
        } else {
            console.debug("ChatController is adding an EventListener for " + toWhat);
            document.getElementById(toWhat).addEventListener(tag, handler);
        }
        listeners.push({obj: toWhat, tag: tag, handler: handler});
        console.debug("After pushing, listeners has length " + listeners.length);
    }

    _clearChat(listeners) {
        // Remove listeners
        listeners.forEach((l) => {
            if(l.obj === document)
                document.removeEventListener(l.tag, l.handler);
            else
                document.getElementById(l.obj).removeEventListener(l.tag, l.handler);
        });
        // Leave game channel
        this._chat_client.leaveChannel(model.gamename);
        // Terminate this chat instance
        closeChat();
    }

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
    _endScoresMessage = "";
    _receivingEndScores = false;
    _tmp_msg = "";
    
    constructor(chat_client) {
        this._listeners = []
        this._chat_client = chat_client;
        this._chat_client.onMessage(async (evt) => {

            this._tmp_msg += await evt.data.text();

            if(!this._tmp_msg.endsWith("\n"))
                return;

            let msg = this._tmp_msg;
            this._tmp_msg = "";
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
                    if(parsed.name != undefined) {
                        if(name.startsWith("@") && (channel == model.status.ga)) {
                            let kind = this._parseSystemMessage(text, channel, name);

                            switch(kind) {
                                case "endgame":
                                    this._receivingEndScores = true;
                                    break;
                                
                                case "end-ladder":
                                    this._receivingEndScores = false;
                                    break;

                                case "ladder":
                                    // let playerNumber = Object.keys(model.status.pl_list).length;
                                    // let scoreMsgs = msgs.splice(i, playerNumber);
                                    // for(let j in scoreMsgs) {
                                        // let scoreMsg = scoreMsgs[j];
                                        // let text = this._parseChatMessage(item).text;
                                        this._parseLadderSystemMessage(text);
                                    // }
                                    break;
                            }
                            
                        } else {
                            this._parseNonSystemMessage(text, channel, name);
                        }
                    }
                }
            }
        });
        // Load listeners
        this.load();
        //
        this._initMatch(); // former MODEL_RUN_GAME
        // Load close management
        this._addChatListener(this._listeners, document, 'miticoOggettoCheNonEsiste.EXIT_GAME', (() => {this._clearChat(this._listeners)}).bind(this), false);
    }

    _initMatch() {
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
            return "endgame";
        }

        // Endgame ladder multiline message
        if (msg.startsWith("(")) {
            return "ladder";
        }

        if(msg.endsWith("-----------------\n")) {
            return "end-ladder";
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

        // Hit-Catch
        if(msgspl[1]==="hit"){
            let murder = model.status.pl_list[msgspl[0]];
            let murdered = model.status.pl_list[msgspl[2]];
            if(murder!=undefined && murdered!=undefined){
                model.murderCatched(murder.name, murdered.name);
                // return;
            }
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
        this._addChatListener(this._listeners, "chatChannelInput", "input", this._validateChannel);
        this._addChatListener(this._listeners, "chatChannelButton", "click", () => {
            this._subscribeChatChannel();
            document.getElementById("canvas").focus();
        });

        this._addChatListener(this._listeners, "chatSendMessageInput", "input", this._validateSend);
        this._addChatListener(this._listeners, "chatSendMessageInput", "keyup", (evt) => {
            if(evt.key === 'Enter') {
                this._sendChatMessage();
                document.getElementById("chatSendMessageInput").value = "";
                this._validateSend();
                document.getElementById("canvas").focus();
            }});
        this._addChatListener(this._listeners, "chatSendChannelInput", "input", this._validateSend);
        this._addChatListener(this._listeners, "chatSendButton", "click", () => {
            this._sendChatMessage();
            document.getElementById("chatSendMessageInput").value = "";
            this._validateSend();
            document.getElementById("canvas").focus();
        });

        this._addChatListener(this._listeners, document, "BUTTON_UNSUBSRIBECHANNEL", (evt) => {
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