
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
    GRASS: [0,0],
    WALL: [0,0],
    RIVER: [0,0],
    OCEAN: [0,0],
    TRAP: [0,0],
    FLAG_BLUE: [0,0],
    FLAG_RED: [0,0],
    RECHARGE: [0,0],
    BARRIER: [0,0],
    PLAYER_BLUE: [0,0],
    PLAYER_RED: [0,0],
    BULLET_VERTICAL: [0,0],
    BULLET_HORIZONTAL: [0,0], //TODO laser tile
    PATHFINDING: [0,0], // TODO path tile
    // GRAVES
    PLAYER_BLUE_KILLED: [3, 0],
    PLAYER_RED_KILLED: [3, 1]
}

// TODO ADD GRASS TYPES 

class WorldUi {
    imgGrass0       = './assets/Terrain/grass_0.png'
    imgGrass1       = './assets/Terrain/grass_1.png'
    imgGrass2       = './assets/Terrain/grass_2.png'
    imgGrass3       = './assets/Terrain/grass_3.png'
    imgGrass4       = './assets/Terrain/grass_4.png'
    imgGrass5       = './assets/Terrain/grass_5.png'
    imgGrass6       = './assets/Terrain/grass_6.png'
    imgGrass7       = './assets/Terrain/grass_7.png'

    imgWall0        = './assets/Terrain/wall_0.png'
    imgWall1        = './assets/Terrain/wall_1.png'
    imgWall2        = './assets/Terrain/wall_2.png'
    imgWall3        = './assets/Terrain/wall_3.png'
    imgWall4        = './assets/Terrain/wall_4.png'
    imgWall5        = './assets/Terrain/wall_5.png'
    imgWall6        = './assets/Terrain/wall_6.png'
    imgWall7        = './assets/Terrain/wall_7.png'

    imgFlagRed        = './assets/Terrain/flag.png'
    imgFlagBlue        = './assets/Terrain/flag.png'

    imgRiver       = './assets/Terrain/river.png'
    imgOcean       = './assets/Terrain/ocean.png'
    
    imgTrap        = './assets/Terrain/trap.png'
    imgBarrier     = './assets/Terrain/barrier.png'
    imgRecharge    = './assets/Terrain/recharge.png'

    imgPlayerBlue  = './assets/Player/player_blue.png'
    imgPlayerRed   = './assets/Player/player_red.png'

    imgBulletVertical  = './assets/Laser/laser_vertical.png'
    imgBulletHorizontal   = './assets/Laser/laser_horizontal.png'

    imgPathfinding = './assets/Pathfinding/pathfinding_0.png'


    imgTileSet = './assets/mod32x32_map_tilev2.png'    
    imgTileSetGraves = './assets/grave_markers-shadow.png'   

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
            this.tileGraves = this._getImage('graves');
            
            this.tileGrass = [this._getImage('grass_0'), this._getImage('grass_1'), 
                            this._getImage('grass_2'), this._getImage('grass_3'), 
                            this._getImage('grass_4'), this._getImage('grass_5'), 
                            this._getImage('grass_6'),this._getImage('grass_7')];

            this.tileWall = [this._getImage('wall_0'), this._getImage('wall_1'), 
                            this._getImage('wall_2'), this._getImage('wall_3'), 
                            this._getImage('wall_4'), this._getImage('wall_5'), 
                            this._getImage('wall_6'),this._getImage('wall_7')];
            this.tileFlagRed =  this._getImage('flag-red');
            this.tileFlagBlue =  this._getImage('flag-blue');
            
            this.tileRiver = this._getImage('river');
            this.tileOcean = this._getImage('ocean');
            this.tileTrap = this._getImage('trap');
            this.tileBarrier = this._getImage('barrier');
            this.tileRecharge = this._getImage('recharge');
            this.tilePlayerBlue = this._getImage('player-blue');
            this.tilePlayerRed = this._getImage('player-red');
            this.tilePathfinding = this._getImage('pathfinding');

            this.tileBulletVertical = this._getImage('bullet-vertical');
            this.tileBulletHorizontal = this._getImage('bullet-horizontal');

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
        let atlas;

        let symbol_code = symbol.charCodeAt(0);

        if (symbol_code == 88) { // X: team RED flag (A)
            tile = Terrain.GRASS;
            team = 0;
            type = "flag";
            atlas = this.tileGrass[0];
        }
        else if (symbol_code == 120) { // x: team BLUE flag (B)
            tile = Terrain.GRASS;
            team = 1;
            type = "flag";
            atlas = this.tileGrass[0];
        }        
        else if(symbol_code >= 65 && symbol_code <= 84) {  // uppercase letter team 0
            // use background grass
            tile = Terrain.GRASS;
            team = 0;
            type = "player";
            atlas = this.tileGrass[0];
        }
        else if (symbol_code >= 97 && symbol_code <= 116) {// lowecase letter team 1
            // use background grass
            tile = Terrain.GRASS;
            team = 1;
            type = "player";
            atlas = this.tileGrass[0];
        }
        else { // terrains
            type = "terrain";
            switch(symbol) {
                case ".":
                    tile = Terrain.GRASS;
                    atlas = this.tileGrass[(col+row*col) % this.tileGrass.length]; // maybe random with a seed?
                    break;
                case "#":
                    tile = Terrain.WALL;
                    atlas = this.tileWall[(col+row*col) % this.tileWall.length]; // maybe random with a seed?
                    break;
                case "~":
                    tile = Terrain.RIVER;
                    atlas = this.tileRiver;
                    break;
                case "@":
                    tile = Terrain.OCEAN;
                    atlas = this.tileOcean;
                    break;
                case "!":
                    tile = Terrain.GRASS;
                    atlas = this.tileGrass[0];
                    type = "trap"
                    break;
                case "$":
                    tile = Terrain.RECHARGE;
                    atlas = this.tileRecharge;
                    type = "recharge"
                    break;
                case "&":
                    tile = Terrain.GRASS;
                    atlas = this.tileGrass[0];
                    type = "barrier"
                    break;
                default:
                    console.debug("ERROR map symbol: " + x)
                    break;
            }
        }
        // return correct position in tilemap and the atlas
        return [atlas, tile, symbol, team, type]
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
            this._drawTraps();
            this._drawPlayers();
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
        this.tmp_objects = [];
        for (let c = 0; c < map.cols; c++) {
            for (let r = 0; r < map.rows; r++) {
                let [atlas, tile, symbol, team, type] = this._getTile(c, r); // TODO do not draw players!
                this.ctx.drawImage(atlas, // image
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
                } else if (type === "trap" || type === "barrier" || type === "recharge" || type === "flag") { 
                    this.tmp_objects.push([type, c, r, team]);
                }
            }
        }
    }

    _drawTraps() {
        let map = model._map;
        let tile;
        let atlas;

        this.tmp_objects.forEach( (trap) => {
                            let [type, c, r, team] = trap;
                            if (type === "trap") {
                                tile = Terrain.TRAP;
                                atlas = this.tileTrap;
                            }
                            else if (type === "barrier") {
                                tile = Terrain.BARRIER;
                                atlas = this.tileBarrier;
                            }
                            else if (type === "recharge") {
                                tile = Terrain.RECHARGE;
                                atlas = this.tileRecharge;
                            } else if (type === "flag") {
                                if(team == 0) {
                                    tile = Terrain.FLAG_RED;
                                    atlas = this.tileFlagRed;
                                } else {
                                    tile = Terrain.FLAG_BLUE;
                                    atlas = this.tileFlagBlue;
                                }
                            }

                            this.ctx.drawImage(
                                atlas, // image
                                tile[0] * map.tsize, // source x
                                tile[1] * map.tsize, // source y
                                map.tsize, // source width
                                map.tsize, // source height
                                c * this._tsizeMap,  // target x
                                r * this._tsizeMap, // target y
                                this._tsizeMap, // target width
                                this._tsizeMap // target height
                            );
                        });
    }   

    _drawPlayers() {
        let map = model._map;
        let tile;
        let atlas;
        this.tmp_players.forEach( (map_pl) => {
                        let [symbol, team, c, r] = map_pl;
                        let pl = model.findPlayerBySymbol(symbol);
                        if(pl != undefined) {
                            if (pl.state == "KILLED") {
                                tile = (team == 0 ? Terrain.PLAYER_RED_KILLED : Terrain.PLAYER_BLUE_KILLED);
                                atlas = this.tileGraves;
                            } else {
                                if (team == 0) {
                                    tile = Terrain.PLAYER_RED;
                                    atlas = this.tilePlayerRed;
                                } else {
                                    tile = Terrain.PLAYER_BLUE;
                                    atlas = this.tilePlayerBlue;
                                }
                            }

                            this.ctx.drawImage(
                                atlas, // image
                                tile[0] * map.tsize, // source x
                                tile[1] * map.tsize, // source y
                                map.tsize, // source width
                                map.tsize, // source height
                                c * this._tsizeMap,  // target x
                                r * this._tsizeMap, // target y
                                this._tsizeMap, // target width
                                this._tsizeMap // target height
                            );
                        }
                        });
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
            let atlas;
            if (counter > 0) {
                console.debug("drawing shoots: " + x +", " + " " + direction + " " + counter);
                // choose tile
                if (direction == "vertical") {
                    tile = Terrain.BULLET_VERTICAL;
                    atlas = this.tileBulletVertical;
                } else { 
                    tile = Terrain.BULLET_HORIZONTAL;
                    atlas = this.tileBulletHorizontal;
                }
                this.ctx.drawImage(
                    atlas, // image
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
            let tile = Terrain.PATHFINDING;
            let atlas = this.tilePathfinding;
            if (counter > 0) {
                this.ctx.drawImage(
                    atlas, // image
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
            this._loadImage('tiles', this.imgTileSet),
            this._loadImage('graves', this.imgTileSetGraves),
            this._loadImage('grass_0', this.imgGrass0),
            this._loadImage('grass_1', this.imgGrass1),
            this._loadImage('grass_2', this.imgGrass2),
            this._loadImage('grass_3', this.imgGrass3),
            this._loadImage('grass_4', this.imgGrass4),
            this._loadImage('grass_5', this.imgGrass5),
            this._loadImage('grass_6', this.imgGrass6),
            this._loadImage('grass_7', this.imgGrass7),
            this._loadImage('wall_0', this.imgWall0),
            this._loadImage('wall_1', this.imgWall1),
            this._loadImage('wall_2', this.imgWall2),
            this._loadImage('wall_3', this.imgWall3),
            this._loadImage('wall_4', this.imgWall4),
            this._loadImage('wall_5', this.imgWall5),
            this._loadImage('wall_6', this.imgWall6),
            this._loadImage('wall_7', this.imgWall7),
            this._loadImage('flag-red', this.imgFlagRed),
            this._loadImage('flag-blue', this.imgFlagBlue),
            this._loadImage('river', this.imgRiver),
            this._loadImage('ocean', this.imgOcean),
            this._loadImage('trap', this.imgTrap),
            this._loadImage('barrier', this.imgBarrier),
            this._loadImage('recharge', this.imgRecharge),
            this._loadImage('player-blue', this.imgPlayerBlue),
            this._loadImage('player-red', this.imgPlayerRed),
            this._loadImage('pathfinding', this.imgPathfinding),
            this._loadImage('bullet-vertical', this.imgBulletVertical),
            this._loadImage('bullet-horizontal', this.imgBulletHorizontal)
        ];
    }.bind(this);
    
};

