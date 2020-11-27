
//Terrain types
// .  grass, freely walkable, allow shooting
// #  wall, not walkable, stops shoots
// ~  river, walkable, cannot shoot while on it, allow shooting through it
// @  ocean, not walkable, allow shooting through it
// !  trap, will subtract energy from player if walked on, allow shooting through it
// GRASS: [19,7],
// WALL: [1,0],
// RIVER: [4,0],
// OCEAN: [3,4],
// TRAP: [4,1],
// FLAG: [0,0],
// RECHARGE: [0,0],
// BARRIER: [0,0]
const Terrain = {
    GRASS: [1,2],
    WALL: [3,3],
    RIVER: [3,21],
    OCEAN: [5,21],
    TRAP: [0, 9],
    FLAG_BLUE: [0, 10],
    FLAG_RED: [1, 10],
    RECHARGE: [1,9],
    BARRIER: [21,3],
    PLAYER_BLUE: [0, 8],
    PLAYER_RED: [1, 8],
    BULLET: [21,21] //TODO laser tile
}

class WorldUi {

    imgTileSet = './assets/mod32x32_map_tilev2.png'    
    
    images = {}

    _rendering = false
    
    dragStart=null
    dragged
    scaleFactor = 1.01

    tmp_players = []
    _initSize;
    _imageLoaded = false;

    constructor(ctx) {
        this.ctx = ctx;
        let p = this._loads();
        Promise.all(p).then(function (loaded) {
            this.tileAtlas = this._getImage('tiles');
            this._imageLoaded = true;
        }.bind(this));
        
        this._load();

    };

    _load() {
        // Listeners for UI
        this._loadWsMessages();
    };

    _getTile(col, row) {
        let map = model._map;
        let idx = row * map.cols + col;
        let symbol = map.tiles[idx];
        let tile;
        let team = -1;
        let type = "";
        let symbol_code = symbol.charCodeAt(0);
        if (symbol_code == 88) { // X: team RED flag (A)
            tile = Terrain.FLAG_RED;
            team = 0;
            type = "flag";
        }
        else if (symbol_code == 120) { // x: team BLUE flag (B)
            tile = Terrain.FLAG_BLUE;
            team = 1;
            type = "flag";
        }        
        else if(symbol_code >= 65 && symbol_code <= 84) {  // uppercase letter team 0
            tile = Terrain.PLAYER_RED;
            team = 0;
            type = "player";
        }
        else if (symbol_code >= 97 && symbol_code <= 116) {// lowecase letter team 1
            tile = Terrain.PLAYER_BLUE;
            team = 1;
            type = "player";
        }
        else { // terrains
            switch(symbol) {
                case ".":
                    tile = Terrain.GRASS;
                    break;
                case "#":
                    tile = Terrain.WALL;
                    break;
                case "~":
                    tile = Terrain.RIVER;
                    break;
                case "@":
                    tile = Terrain.OCEAN;
                    break;
                case "!":
                    tile = Terrain.TRAP;
                    break;
                case "$":
                    tile = Terrain.RECHARGE;
                    break;
                case "&":
                    tile = Terrain.BARRIER;
                    break;
                case "*": // TODO LUCA // not a terrain, actually
                    tile = Terrain.BULLET;
                    break;
                default:
                    console.debug("ERROR map symbol: " + x)
                    break;
            }
            type = "terrain";
        }
        // return correct position in tilemap and the atlas
        return [tile, symbol, team, type]
    };

    _initCanvasSize() {
        // Lookup the size the browser is displaying the canvas.
        let displayWidth  = window.innerWidth*0.9;
        let displayHeight = window.innerHeight*0.9;

        let sz = 0;
        if(displayWidth<displayHeight) {sz=displayWidth;} else {sz=displayHeight;}
        displayHeight = displayWidth = sz;
        
        if (this.ctx.canvas.width  != displayWidth ||
            this.ctx.canvas.height != displayHeight) {
            // Make the canvas the same size
            this.ctx.canvas.width  = displayWidth;
            this.ctx.canvas.height = displayHeight;
        }
        this.lastX = canvas.width/2
        this.lastX  = canvas.height/2
        
        this._tsizeMap = Math.floor(this.ctx.canvas.height / model._map.rows)
        this.ctx.canvas.width  = this._tsizeMap * model._map.rows;
        this.ctx.canvas.height = this._tsizeMap * model._map.cols;
    }

    renderMap() {
        if (this._imageLoaded) {
            if (!this._initSize) {
                this._initCanvasSize();
                this._initSize = true;
            }
            // this._clearCanvas();
            this._drawMap();
            this._drawShoots();
            this._drawPathfinding();
            this._drawPlayerNames();
        };
        window.requestAnimationFrame(this.renderMap.bind(this));
    };


    _drawMap() {
        let map = model._map;
        // let tsizeMap = Math.floor(this.ctx.canvas.height / this._N)
        this.tmp_players = [];
        for (let c = 0; c < map.cols; c++) {
            for (let r = 0; r < map.rows; r++) {
                let [tile, symbol, team, type] = this._getTile(c, r);
                if (tile !== (0,0)) { // 0 => empty tile
                    this.ctx.drawImage(
                        this.tileAtlas, // image
                        tile[0] * map.tsize, // source x
                        tile[1] * map.tsize, // source y
                        map.tsize, // source width
                        map.tsize, // source height
                        c * this._tsizeMap,  // target x
                        r * this._tsizeMap, // target y
                        this._tsizeMap, // target width
                        this._tsizeMap // target height
                    );
                    if (type === "player") {
                        this.tmp_players.push([symbol, team, c, r]);
                    }
                }
            }
        }
    }

    _drawPlayerNames() {
        for (let i=0; i<this.tmp_players.length; i++) {
            let [symbol, team, c, r] = this.tmp_players[i];
            // let this._tsizeMap = Math.floor(this.ctx.canvas.height / this._N)

            let player = model.findPlayerBySymbol(symbol);
            if (typeof player !== 'undefined') {
                // draw backroung character:
                if (team == 0) {
                    if (typeof me_symbol !== 'undefined' && model.status.me.symbol.localeCompare(symbol) == 0) {
                        this.ctx.font = '12px Arial'
                        this.ctx.fillStyle = model.teamColors.mePlayer;
                    } else {
                        this.ctx.font = '8px Arial'
                        this.ctx.fillStyle = model.teamColors.teamA;
                    }
                } else {
                    if (typeof me_symbol !== 'undefined' && model.status.me.symbol.localeCompare(symbol) == 0) {
                        this.ctx.font = '12px Arial'
                        this.ctx.fillStyle = model.teamColors.mePlayer;
                    } else {
                        this.ctx.font = '8px Arial'
                        this.ctx.fillStyle = model.teamColors.teamB;
                    }
                }
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "bottom";
                this.ctx.fillText(player.name, c * this._tsizeMap + Math.floor(this._tsizeMap/2), r * this._tsizeMap);
            }
        }        
    }

    _drawShoots() {
        let shoots = model.shoots;
        let map = model._map;
        for (let i=0; i<shoots.length; i++) {
            let shoot = shoots[i];
            let x = shoot.x;
            let y = shoot.y;
            let direction = shoot.direction;
            let counter = shoot.counter;
            let tile;
            
            if (counter > 0) {
                console.debug("drawing shoots: " + x +", " + " " + direction + " " + counter);
                // choose tile
                if (direction == "vertical") 
                    tile = Terrain.BULLET;
                else 
                    tile = Terrain.BULLET;
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    tile[0] * map.tsize, // source x
                    tile[1] * map.tsize, // source y
                    map.tsize, // source width
                    map.tsize, // source height
                    x * this._tsizeMap,  // target x
                    y * this._tsizeMap, // target y
                    this._tsizeMap, // target width
                    this._tsizeMap // target height
                );
                model.shoots[i].counter--;  // TODO terrible modify the model
            }
        }
    }

    _drawPathfinding() {
        let path = model.path;
        let map = model._map;
        for (let i=0; i<path.length; i++) {
            let x = path[i].x;
            let y = path[i].y;
            let counter = path[i].counter;
            let tile = Terrain.BULLET;
            if (counter > 0) {
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    tile[0] * map.tsize, // source x
                    tile[1] * map.tsize, // source y
                    map.tsize, // source width
                    map.tsize, // source height
                    x * this._tsizeMap,  // target x
                    y * this._tsizeMap, // target y
                    this._tsizeMap, // target width
                    this._tsizeMap // target height
                );
                model.path[i].counter--;
            }

        }
    }


    _loadWsMessages() {
        document.addEventListener("MODEL_SETMAP", () => {
            if (!this._rendering) {
                window.requestAnimationFrame(this.renderMap.bind(this));    
                this._rendering = true;
            }
        }, false);
    }

    
    _loadImage = function (key, src) {
        let img = new Image();
    
        let d = new Promise(function (resolve, reject) {
            img.onload = function () {
                this.images[key] = img;
                resolve(img);
            }.bind(this);
    
            img.onerror = function () {
                reject('Could not load image: ' + src);
            };
        }.bind(this));
    
        img.src = src;
        return d;
    };
    
    _getImage = function (key) {
        return (key in this.images) ? this.images[key] : null;
    };

    _loads = function () {
        return [
            this._loadImage('tiles', this.imgTileSet)
        ];
    }.bind(this);




    
};

