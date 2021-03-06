class MatchController {

    // This class controls:
    // PHYSICAL GAME
    // MAP HANDLING
    // STATUS HANDLING
    // POLLING
    // SOCIAL DEDUCTION GAME
    // TOURING GAME
    // LISTENERS

    _gameClient;

    _listeners = [];

    _addMatchListener(listeners, toWhat, tag, handler, consumes) {
        if(toWhat === document) {
            document.addEventListener(tag, handler, consumes);
        } else {
            console.debug("ChatController is adding an EventListener for " + toWhat);
            document.getElementById(toWhat).addEventListener(tag, handler);
        }
        listeners.push({obj: toWhat, tag: tag, handler: handler});
    }

    _clearMatch(listeners) {
        // Remove listeners
        listeners.forEach((l) => {
            console.debug("MatchController is clearing listener on " + l.obj);
            if(l.obj === document)
                document.removeEventListener(l.tag, l.handler);
            else
                document.getElementById(l.obj).removeEventListener(l.tag, l.handler);
        });
        // Stop polling
        console.debug("MatchController is shutting polling down.");
        this._stopPoller();
        // Stop music
        console.debug("MatchController is stopping the music.");
        this.sfxAudio.stopGameSound();
        this.sfxAudio.playMenuSound(.1);
        // Terminate this controller instance
        closeMatch();
    }

    constructor(gameClient, sfxAudio) {
        this.sfxAudio = sfxAudio;
        this._gameClient = gameClient;
        // Load listeners
        this.load();
        // Load close management
        this._addMatchListener(this._listeners, document, 'miticoOggettoCheNonEsiste.EXIT_GAME', (() => {this._clearMatch(this._listeners)}).bind(this), false);
        // Canvas stuff
        this._trackTransforms(document.getElementById("canvas").getContext("2d"));
        // Initialize game
        this._initMatch(); // former MODEL_RUN_GAME
    }

    _initMatch() {
        // Init human commands
        // Session-related commands during the lobby (keys)
        if(model.imCreator(model.status.ga)){
            this._addMatchListener(this._listeners, "start-button","click", () => {
                console.debug("MatchController is asking the game client to START the joined game");
                this._gameClient.startGame(model.status.ga);
            });
        }
        // Stop menu music
        this.sfxAudio.stopMenuSound();
        // Start game music
        this.sfxAudio.playGameSound(model.musicVolume);
        // Init map polling
        this._pollOnce(); // TODO POLLING: this._poller(); 
        model.startRefreshMap();
        // Loads the specialized listeners
        switch(model.kind) {
            case model.PLAYER:
                console.debug("Match Controller is loading the player listeners...");
                this._loadPlayerOnRunGame();
            break;
            case model.SPECTATOR:
                console.debug("Match Controller is loading the spectator listeners...");
                this._loadSpectatorOnRunGame();
            break;
            default:
                console.error("Unable to retrieve user kind.");
                popupMsg("Are you a PLAYER or a SPECTATOR?", "danger");
        }
    }

    /* PHYSICAL GAME */

    humanHandler(event, gameClient) {
        switch(event.key) {
            case " ":
                // SHOOT
                console.debug("MatchController is asking the game client to SHOOT in the last direction moved (" + model.status.me.lastDirection + ").");
                gameClient.shoot(model.status.me.lastDirection);
                break;
            default:
                // MOVE. Moving also sets the lastDirection in which the player shoots.
                let newDirection = undefined;
                switch(event.key) {
                case "w":
                    console.debug("MatchController acknowledged the wish of the player to MOVE UP and is going to behave accordingly.");
                    newDirection = GameClient.UP;
                    break;
                case "a":
                    console.debug("MatchController acknowledged the wish of the player to MOVE LEFT and is going to behave accordingly.");
                    newDirection = GameClient.LEFT;
                    break;
                case "s":
                    console.debug("MatchController acknowledged the wish of the player to MOVE DOWN and is going to behave accordingly.");
                    newDirection = GameClient.DOWN;
                    break;
                case "d":
                    console.debug("MatchController acknowledged the wish of the player to MOVE RIGHT and is going to behave accordingly.");
                    newDirection = GameClient.RIGHT;
                    break;
                }
                if(newDirection) {
                    console.debug("MatchController is asking the game client to move " + newDirection);
                    gameClient.move(newDirection);
                    model.status.me.lastDirection = newDirection;
                }
        }
    }




    // Laser

    shootHandler(evt) { // TODO LUCA
        let shooter = evt.detail.shooter;
        let direction = evt.detail.direction;
        console.debug("Match Controller has received a SHOOT: " + shooter + " in direction: " + direction);
        this.sfxAudio.playShoot();
        // I'll avoid making a copy of the whole map...
        // let position = model.status.me.position;
        let position =  {x: parseInt(model.status.pl_list[shooter].x), y: parseInt(model.status.pl_list[shooter].y)};
        this.computeShootOnMap(position, direction);
        model.shootAnimationStart(shooter,direction);
        console.debug("Match Controller computed the map with the shot and is going to set the new map in the model.");
        model.setMap(model.world._map); // update needed to fire the rendering action
    }

    computeShootOnMap(shooterPosition, direction) {
        console.debug("Match Controller is computing SHOOT in direction " + direction + " from position: " + shooterPosition.x + "," + shooterPosition.y);
        
        let stopsBullet = (tile) => {
            //console.debug("check &");
            if(tile == "&") return true;
            //console.debug("check #");
            if(tile == "#") return true;
            //console.debug("check players");
            if(/^[A-Ta-t]$/.test(tile)) return true;
            return false;
        }

        let deltaX = 0, deltaY = 0;
        switch(direction) {
            case GameClient.UP:
                deltaY = -1;
                break;
            case GameClient.DOWN:
                deltaY = 1;
                break;
            case GameClient.LEFT:
                deltaX = -1;
                break;
            case GameClient.RIGHT:
                deltaX = 1;
                break;
        }
        let firstX = shooterPosition.x + deltaX;
        //console.debug("firstX: " + firstX);
        let firstY = shooterPosition.y + deltaY;
        //console.debug("firstY: " + firstY);
        let limitX = model.world._map.cols;
        //console.debug("limitX: " + limitX);
        let limitY = model.world._map.rows;
        //console.debug("limitY: " + limitY);
        let cells = 0;
        let bulletStopped = false;
        for(
            let c = firstX, r = firstY;

            c < limitX && r < limitY &&
            r >= 0 && c >= 0 &&
            !bulletStopped;

            c += deltaX, r += deltaY
        ) {
            let idx = r * model.world._map.cols + c;
            let tile = model.world._map.tiles[idx];
            // console.log("Checking " + r + "," + c + " (" + tile + ")");
            bulletStopped = stopsBullet(tile);
            //console.debug("bulletStopped: " + bulletStopped);
            if(!bulletStopped) {
                let dirLinear = (direction == "E" || direction == "W") ? "horizontal" : "vertical";

                model.shoots.push({x:c, y:r, direction: dirLinear, counter:3}); // direction vertical, horizontal
                cells++;
            };
        };
        console.debug("Match Controller: shot over " + cells + " cells.");
    };

    /* MAP HANDLING */

    lookMapHandler(evt) {
        //LOOK MAP save to model
        //console.debug("LOOKMAPHANDLER " + evt.detail);
        let msgOk = evt.detail.startsWith("OK");
        if(!msgOk){
            popupMsg(evt.detail, "danger");
            return;
        }
        // parse map
        let map = evt.detail;
        let map_obj;
        let parsed_map = map.slice(7).replace('«ENDOFMAP»', '').replace(/\n/g, '').split('');
        let numTiles = parsed_map.length;
        if(numTiles == 1024 || numTiles == 4096 || numTiles == 16384) { // worst code ever. I'm gonna whip myself for this. (luca)
            let N = Math.sqrt(parsed_map.length);
            map_obj = {
                cols: N,
                rows: N,
                tiles: parsed_map
            }
        } else {
            let N = Math.sqrt(parsed_map.length/2);
            map_obj = {
                cols: N*2,
                rows: N,
                tiles: parsed_map
            }
        }
        // update model
        model.setMap(map_obj);
        // extract local interesting information from the map
    };


    /* STATUS HANDLING */

    getStatusHandler(evt){
        //console.debug("getStatusHandler: " + evt.detail);
        let msgOk = evt.detail.startsWith("OK");
        if(!msgOk){
            // alert("HUD[!]" + evt.detail);
            popupMsg(evt.detail, "danger");
            return;
        }
        let status = {};
        let ga = {};
        let me = {};
        status.pl_list = [];

        let stat = evt.detail.slice(7).replace("«ENDOFSTATUS»",'').trim().split('\n');
        let ga_list = stat[0].slice(4).split(' ')
        for(let j=0;j<ga_list.length;j++){
            let key = ga_list[j].split('=')[0]
            let value = ga_list[j].substring(ga_list[j].indexOf('=')+1);
            ga[key] = value
        }
        status.ga = ga.name;
        status.state = ga.state;
        status.size = ga.size;
        status.me = me;

        if(stat.length>1){
            let pl_start=2;
            if(stat[1].startsWith("ME:")){
                let me_list = stat[1].slice(4).split(' ');
                for(let j=0;j<me_list.length;j++){
                    let key =me_list[j].split('=')[0]
                    let value =  me_list[j].substring( me_list[j].indexOf('=')+1);
                    me[key] = value
                }
            }
            else{
                pl_start=1;
            }
            
            let pls = {};
            for(let i=pl_start;i<stat.length;i++){
                let pl = {};
                let pl_list = stat[i].slice(4).split(' ')
                for(let j=0;j<pl_list.length;j++){
                    let key = pl_list[j].split('=')[0]
                    let value =  pl_list[j].substring( pl_list[j].indexOf('=')+1);
                    pl[key] = value
                }
                pls[pl.name] = pl;
            }
            status.me = me;
            status.pl_list = pls;
        }

        model.setStatus(status);
    };

    /* POLLING */

    _getMap() {
        //console.debug("Polling map")
        if(model.status.ga != undefined) {
            let gameName = model.status.ga;
            this._gameClient.lookMap(gameName);
        }
        // setMap()
    };

    _getStatus(){
        //console.debug("status poller run");
        let gameName = model.status.ga;
        //console.debug("matchController: try to get status for " + gameName);
        this._gameClient.getStatus(gameName)
    };

    _pollOnce() {
        this._getMap();
        this._getStatus();
    };

    _poller() {
        this._statusPoller();
        this._mapPoller();
    };

    _statusPoller() {
        let timeframe = model.timeframeStatus;
        this._getStatus();
        this._sPoller = window.setTimeout(function(){ this._statusPoller() }.bind(this), timeframe);
    };

    _mapPoller() {
        let timeframe = model.timeframeMap;
        this._getMap();
        this._mPoller = window.setTimeout(function(){ this._mapPoller() }.bind(this), timeframe);
    };

    _stopPoller() {
        window.clearTimeout(this._sPoller);
        window.clearTimeout(this._mPoller);
        this._gameClient.cleanWSQueues();
    }

    /* SOCIAL DEDUCTION GAME */

    accuseResponseHandler(evt){
        console.debug("Match Controller has received a ACCUSE response"); 
        let msgOk = evt.detail.startsWith("OK");
        if(msgOk) {
            console.debug("Match Controller accept an accuse");
        } else {
            console.error("Match Controller retrieved an error from the server while accusing.");
        }
    };

    /* SOCIAL DEDUCTION GAME */

    _touringQueue = []; // {name: string, touring: string}

    touringResponseHandler(evt, choice) {
        console.debug("MatchController is setting touring choice for " + model.status.pl_list[choice.name].name + " as " + choice.touring);
        model.status.pl_list[choice.name].touring = choice.touring;
    }

    /* PATHFINDING */

    _pathfindingMove(evt, gameClient) {
        let nextMove = model.popNextPathfindingMove();
        if(nextMove != undefined) { // no path to follow
            console.debug("MatchController _pathfindingMove is asking the game client to pathfinding-move " + nextMove);
            gameClient.move(nextMove);
            model.status.me.lastDirection = nextMove;
        } 
    }

    _moveHandler(event, gameClient) {
        // if pathfing exist recompute it or continue till end? TODO
        let nextMove = model.popNextPathfindingMove();
        if(nextMove != undefined) {
            console.debug("MatchController _moveHandler is asking the game client to pathfinding-move " + nextMove);
            gameClient.move(nextMove);
            model.status.me.lastDirection = nextMove;
        }
    }


    /* MAP TRANSFORMATIONS AND MAP HANDLERS */

    _dragStart = null
    _dragged = false;
    _scaleFactor = 1.01;

    _clearCanvas() {
        let ctx = document.getElementById("canvas").getContext("2d");
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.restore();
    }

    _resizeCanvasHandler() {
        let ctx = document.getElementById("canvas").getContext("2d");
        let displayWidth  = window.innerHeight// * 0.9
        let displayHeight = window.innerWidth// * 0.9
        
        this._tsizeMap = Math.floor(displayHeight / model.world._map.rows)
        ctx.canvas.width  = this._tsizeMap * model.world._map.rows;
        ctx.canvas.height = this._tsizeMap * model.world._map.cols;
        this._clearCanvas();
        // this._trackTransforms(document.getElementById("canvas").getContext("2d"))
        model.startRefreshMap();
    }

    _zoom(clicks){
        let ctx = document.getElementById("canvas").getContext("2d");
        let pt = ctx.transformedPoint(this.lastX,this.lastY);
        ctx.translate(pt.x,pt.y);
        let factor = Math.pow(this._scaleFactor,clicks);
        ctx.scale(factor,factor);
        ctx.translate(-pt.x,-pt.y);
        this._clearCanvas();
        model.startRefreshMap();
    }

    _handleScroll(evt){
        let delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
        if (delta) this._zoom(delta);
        this._clearCanvas();
        model.startRefreshMap();
        return evt.preventDefault() && false;
    };
    
    _mouseDownHandler(evt) {
        if (!(evt.ctrlKey && evt.which == 1) && !(evt.which > 1)) { // !(evt.which > 1) because 2/3 (right click) is used for shooting.
            let ctx = document.getElementById("canvas").getContext("2d");
            // canvas.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
            this.lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
            this.lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
            this._dragStart = ctx.transformedPoint(this.lastX,this.lastY);
            this._dragged = false;
            // return evt.preventDefault() && false;
        }
    };

    _mouseMoveHandler(evt) {
        let ctx = document.getElementById("canvas").getContext("2d");

        this.lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        this.lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        this._dragged = true;
        if (this._dragStart){
            let pt = ctx.transformedPoint(this.lastX,this.lastY);
            ctx.translate(pt.x-this._dragStart.x,pt.y-this._dragStart.y);
            this._clearCanvas();
            model.startRefreshMap();
        }
    }

    _mouseUpHandler(evt) {
        this._dragStart = null;
    };

    _clickHandler(evt) {
        // SHIFT + mouse click
        if (evt.ctrlKey && evt.which == 1) {
            let ctx = document.getElementById("canvas").getContext("2d");
            let canvasHeight = ctx.canvas.height;
            let canvasWidth = ctx.canvas.width;
            let mapC = model.world._map.cols;
            let mapR = model.world._map.rows;
            let tsizeMap = canvasHeight / mapR;

            let pt = ctx.transformedPoint(this.lastX, this.lastY);
            // console.debug("_clickHandler:pt " + "(" + pt.x + ", " + pt.y);
            if(pt.x >= 0 && pt.x < canvasWidth && pt.y >= 0 && pt.y <= canvasHeight) {
                // check square position
                let targetC = Math.floor(pt.x / tsizeMap);
                let targetR = Math.floor(pt.y / tsizeMap);
                let start = model.findMyPosition();
                if(start == undefined)
                return 
                let jp = new PathFinder(model.world._map);
                let path = jp.findPath(start.x, start.y, targetC, targetR); 
                if(path) { 
                    // update the model
                    model.setPath(path);
                    model.startRefreshMap();
                }
                console.debug("_clickHandler: from " + "(" + start.x + ", " + start.y + ")" + " to " + "(" + targetR + ", " + targetC + ")");
            }
        }
    }
    
    _shootOnClickHandler(evt) {
        console.debug("right click shot!");
        let myPosition = model.findMyPosition();
        if(myPosition) {
            let ctx = document.getElementById("canvas").getContext("2d");
            let canvasHeight = ctx.canvas.height;
            let canvasWidth = ctx.canvas.width;
            let mapC = model.world._map.cols;
            let mapR = model.world._map.rows;
            let tsizeMap = canvasHeight / mapR;
            let north = GameClient.UP;
            let south = GameClient.DOWN;
            let west = GameClient.LEFT;
            let east = GameClient.RIGHT;

            let pt = ctx.transformedPoint(this.lastX, this.lastY);
            if(pt.x >= 0 && pt.x < canvasWidth && pt.y >= 0 && pt.y <= canvasHeight) {
                // check square position
                let targetX = Math.floor(pt.x / tsizeMap);
                let targetY = Math.floor(pt.y / tsizeMap);
                let charaX = myPosition.x;
                let charaY = myPosition.y;
                let deltaX = Math.abs(targetX-charaX);
                let deltaY = Math.abs(targetY-charaY);
                let direction = undefined;
                console.debug("AIM! targetX: " + targetX + " / targetY: " + targetY + " / charaX: " + charaX + " / charaY: " + charaY);
                // AIM!
                if(targetX >= charaX && targetY <= charaY) // N-E
                    if(deltaY >= deltaX)
                        direction = north;
                    else
                        direction = east;
                if(targetX >= charaX && targetY >= charaY) // S-E
                    if(deltaY <= deltaX)
                        direction = east;
                    else
                        direction = south;
                if(targetX <= charaX && targetY >= charaY) //  S-W
                    if(deltaY >= deltaX)
                        direction = south;
                    else
                        direction = west;
                if(targetX <= charaX && targetY <= charaY) //  N-W
                    if(deltaY <= deltaX)
                        direction = west;
                    else
                        direction = north;
                // FIRE!
                console.debug("FIRE! Direction: " + direction);
                this._gameClient.shoot(direction)
            }
        }
    }

    // Adds ctx.getTransform() - returns an SVGMatrix
    // Adds ctx.transformedPoint(x,y) - returns an SVGPoint
    _trackTransforms = function(ctx) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
        let xform = svg.createSVGMatrix();
        ctx.getTransform = function(){ return xform; };
        
        let savedTransforms = [];
        let save = ctx.save;
        ctx.save = function(){
            savedTransforms.push(xform.translate(0,0));
            return save.call(ctx);
        };
        
        let restore = ctx.restore;
        ctx.restore = function(){
        xform = savedTransforms.pop();
        return restore.call(ctx);
                };
        
        let scale = ctx.scale;
        ctx.scale = function(sx,sy){
        xform = xform.scaleNonUniform(sx,sy);
        return scale.call(ctx,sx,sy);
                };
        
        let rotate = ctx.rotate;
        ctx.rotate = function(radians){
            xform = xform.rotate(radians*180/Math.PI);
            return rotate.call(ctx,radians);
        };
        
        let translate = ctx.translate;
        ctx.translate = function(dx,dy){
            xform = xform.translate(dx,dy);
            return translate.call(ctx,dx,dy);
        };
        
        let transform = ctx.transform;
        ctx.transform = function(a,b,c,d,e,f){
            let m2 = svg.createSVGMatrix();
            m2.a=a; m2.b=b; m2.c=c; m2.d=d; m2.e=e; m2.f=f;
            xform = xform.multiply(m2);
            return transform.call(ctx,a,b,c,d,e,f);
        };
        
        let setTransform = ctx.setTransform;
        ctx.setTransform = function(a,b,c,d,e,f){
            xform.a = a;
            xform.b = b;
            xform.c = c;
            xform.d = d;
            xform.e = e;
            xform.f = f;
            return setTransform.call(ctx,a,b,c,d,e,f);
        };
        
        let pt  = svg.createSVGPoint();
        ctx.transformedPoint = function(x,y){
            pt.x=x; pt.y=y;
            return pt.matrixTransform(xform.inverse());
        }
    }.bind(this)

    // NAIVE PATHFIND http://ashblue.github.io/javascript-pathfinding/
    

    /* LISTENERS */

    // All listeners common to every kind of user

    load() {
        // Stop Music
        this._addMatchListener(this._listeners, document,"CHAT_GAME_FINISHED", (() => {this.sfxAudio.stopGameSound()}).bind(this));

        // Exit match
        this._addMatchListener(this._listeners, 'close-button', 'click', () => {
            if(model.status.gameActive){
                console.debug("MatchController is asking the game client to LEAVE after the ESCAPE key.");
                this._gameClient.leave();
            }
            // Change model
            model.setRunningGame(false, model.kind);
            // Restore model snapshot before join
            window.cancelAnimationFrame(model.world.animation); // stop map animations
            ModelManager.shot();
            // Dispatch "exit game" event
            document.dispatchEvent(new CustomEvent("miticoOggettoCheNonEsiste.EXIT_GAME"));
        });

        // PATHFINDING
        this._addMatchListener(this._listeners, document,"miticoOggettoCheNonEsiste.MOVE", ((evt) => {this._moveHandler(evt, this._gameClient)}).bind(this), false);

        this._addMatchListener(this._listeners, document,"MODEL_SETPATHFINDING",  ((evt) => {this._pathfindingMove(evt, this._gameClient)}).bind(this), false);

        // MAP
        this._addMatchListener(this._listeners, document,"miticoOggettoCheNonEsiste.LOOK_MAP", (this.lookMapHandler).bind(this), false);

        // Shoot OK event is handled by chat for every player (included "me")
        this._addMatchListener(this._listeners, document,"CHAT_SHOOT", (evt) => {this.shootHandler(evt);});

        // ACCUSE 
        this._addMatchListener(this._listeners, document,"miticoOggettoCheNonEsiste.ACCUSE", ((evt) => { this.accuseResponseHandler(evt) }).bind(this), false);

        // TOURING
        this._addMatchListener(this._listeners, document,"miticoOggettoCheNonEsiste.TOURING", ((evt) => { this.touringResponseHandler(evt, this._touringQueue.shift()) }).bind(this), false);

        // STATUS
        this._addMatchListener(this._listeners, document,"STATUS", this.getStatusHandler, false);

        this._addMatchListener(this._listeners, document,"MODEL_MUSIC_VOLUME", ((evt) => {
            this.sfxAudio.changeGameVolume(evt.detail.volume)}).bind(this))

        //let canvas = document.getElementById("canvas");
        this._addMatchListener(this._listeners, 'canvas','mousedown', ((evt) => {this._mouseDownHandler(evt)}).bind(this),false);

        this._addMatchListener(this._listeners, 'canvas','mousemove', ((evt) => {this._mouseMoveHandler(evt)}).bind(this),false);

        this._addMatchListener(this._listeners, 'canvas','mouseup', ((evt) => {this._mouseUpHandler(evt)}).bind(this),false);

        this._addMatchListener(this._listeners, 'canvas','DOMMouseScroll', ((evt) => {this._handleScroll(evt)}).bind(this),false);
        this._addMatchListener(this._listeners, 'canvas','mousewheel', ((evt) => {this._handleScroll(evt)}).bind(this),false);

        this._addMatchListener(this._listeners, 'canvas',"click", ((evt) => {this._clickHandler(evt)}).bind(this),false);

        // SETTINGS
        // SHOW MINIMAP
        let minimapSwitch = document.getElementById("minimapSwitch");
        this._addMatchListener(this._listeners, 'minimapSwitch',"change", (evt)=> {
            if(minimapSwitch.checked) 
                model.showMinimap(true);
            else 
                model.showMinimap(false);
            model.startRefreshMap();

        });

        // GRID VEW
        let gridSwitch = document.getElementById("gridViewSwitch");
        this._addMatchListener(this._listeners, 'gridViewSwitch',"change", (evt)=> {
            if(gridSwitch.checked) 
                model.showGrid(true);
            else
                model.showGrid(false);
            model.startRefreshMap();
        });
        // lowResolutionMap VEW
        let lowResolutionSwitch = document.getElementById("lowResolutionSwitch");
        this._addMatchListener(this._listeners, 'lowResolutionSwitch',"change", (evt)=> {
            if(lowResolutionSwitch.checked) 
                model.lowResolutionMap(true);
            else
                model.lowResolutionMap(false);
            model.startRefreshMap();
        });

        let volumeSlider = document.getElementById("volumeSlider");
        this._addMatchListener(this._listeners, 'volumeSlider',"change", (evt)=> {
            model.setMusicVolume(volumeSlider.value/100);
            // model.startRefreshMap();
        });
    
       

    };

    // Player-specific listeners

    _loadPlayerOnRunGame() {

        this._addMatchListener(this._listeners, document,"MODEL_MATCH_STATUS_ACTIVE", () => {
            // Init human commands
            console.debug("match-controller catches MODEL_MATCH_STATUS_ACTIVE")
            let canvas = document.getElementById("canvas");
            this._addMatchListener(this._listeners, 'canvas',"keyup", (evt) => {this.humanHandler(evt, this._gameClient)}, false);
            // Accuse Button
            this._addMatchListener(this._listeners, document,"BUTTON_ACCUSE", (evt) => {
                let teammateName = evt.detail;
                // _popupMsg("A vote of no confidence for teammate: " + teammateName, "warning");
                this._gameClient.accuse(evt.detail);
            }, false);
            // Start game
            // model.timeframe = model.playerTimeframe;
            model.timeframeMap = model.playerTimeframe;
            model.connectionTimeframe = model.playerTimeframe;
            model.timeframeStatus = model.playerTimeframe * 10;
            
            model.setStartGameTime();
            canvas.focus();
            this._poller();
        }, false);
        
        this._addMatchListener(this._listeners, document,"MODEL_PLAYER_JOINED", () => {
             this._pollOnce(); // TODO POLLING: this._poller(); 
             model.startRefreshMap();
        }, false);

        this._addMatchListener(this._listeners, 'canvas',"contextmenu", ((evt) => {
            // Prevent opening right click menu
            if(evt.preventDefault != undefined) evt.preventDefault(); if(evt.stopPropagation != undefined) evt.stopPropagation();
            // Compute direction and shoot
            this._shootOnClickHandler(evt);
        }).bind(this),false);

        // Touring Button
        this._addMatchListener(this._listeners, document,"BUTTON_TOURING", (evt) => {
            let name = evt.detail.name;
            let touringChoice = evt.detail.touring;
            this._touringQueue.push({name: name, touring: touringChoice});
            this._gameClient.tour(name, touringChoice);
        }, false);
    }

    // Spectator-specific listeners

    _loadSpectatorOnRunGame() {
        this._addMatchListener(this._listeners, document,"MODEL_MATCH_STATUS_ACTIVE", () => {
            // Init human commands
            model.timeframeMap = model.spectatorTimeframe;
            model.connectionTimeframe = model.spectatorTimeframe;
            model.timeframeStatus = model.spectatorTimeframe * 10;
            document.getElementById("canvas").focus();
            this._poller();
        }, false);

        this._addMatchListener(this._listeners, document,"MODEL_PLAYER_JOINED", () => {
            this._pollOnce(); // TODO POLLING: this._poller(); 
            model.startRefreshMap();
       }, false);
    }
    
};

