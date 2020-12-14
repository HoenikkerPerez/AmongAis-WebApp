
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
    PLAYER_BLUE: [[4,19],[4,17],[4,16],[4,18]], //E W N S
    PLAYER_RED: [[4,19],[4,17],[4,16],[4,18]],
    BULLET_VERTICAL: [0,0],
    BULLET_HORIZONTAL: [0,0], //TODO laser tile
    PATHFINDING: [0,0], // TODO path tile
    // DIEING 20
    PLAYER_BLUE_DIE: [[0,20],[1,20],[2,20],[3,20],[4,20],[5,20]], // All animation steps/tiles
    PLAYER_RED_DIE: [[0,20],[1,20],[2,20],[3,20],[4,20],[5,20]],
    // GRAVES
    PLAYER_BLUE_KILLED: [3, 0],
    PLAYER_RED_KILLED: [3, 0]
}

// TODO ADD GRASS TYPES

class WorldUi {
    imgGrassPattern = './assets/Terrain/grassP.jpg'

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

    imgFlagRed        = './assets/Terrain/flag_red.png'
    imgFlagBlue        = './assets/Terrain/flag_blue.png'

    imgRiver       = './assets/Terrain/river.png'
    imgOcean       = './assets/Terrain/ocean.png'

    imgTrap        = './assets/Terrain/trap.png'
    imgBarrier     = './assets/Terrain/barrier0.png'
    imgRecharge    = './assets/Terrain/recharge.png'

    imgPlayerBlue  = './assets/Player/player_blue64.png'
    imgPlayerRed   = './assets/Player/player_red64.png'

    imgBulletVertical  = './assets/Laser/laser_vertical.png'
    imgBulletHorizontal   = './assets/Laser/laser_horizontal.png'

    imgPathfinding = './assets/Pathfinding/pathfinding_0.png'


    imgTileSet = './assets/mod32x32_map_tilev2.png'
    imgTileSetGraves = './assets/grave_markers-shadow.png'

    images = {}


    constructor(ctx) {
        this.ctx = ctx;
        let p = this._loads();
        Promise.all(p).then(function (loaded) {
            this.tileAtlas = this._getImage('tiles');
            this.tileGraves = this._getImage('graves');

            this.tileGrassPattern = this._getImage('grass');

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

            this.grassPattern = ctx.createPattern(this.tileGrassPattern, 'repeat');
            model.world._imageLoaded = true;
        }.bind(this));

        this._load();

    };

    _load() {
        // Listeners for UI
        this._loadWsMessages();
    };

    _getTile(col, row) {
        let map = model.world._map;
        let idx = row * map.cols + col;
        let symbol = map.tiles[idx];
        let tile;
        let team = -1;
        let type = "";
        let atlas;
        let tiledim;
        let symbol_code = symbol.charCodeAt(0);

        if (symbol_code == 88) { // X: team RED flag (A)
            tile = Terrain.GRASS;
            team = 0;
            type = "flag";
            atlas = this.tileGrass[0];
            tiledim = 32;
        }
        else if (symbol_code == 120) { // x: team BLUE flag (B)
            tile = Terrain.GRASS;
            team = 1;
            type = "flag";
            atlas = this.tileGrass[0];
            tiledim = 32;
        }
        else if(symbol_code >= 65 && symbol_code <= 87) {  // uppercase letter team 0
            // use background grass
            tile = Terrain.GRASS;
            team = 0;
            type = "player";
            atlas = this.tileGrass[0];
            tiledim = 32;
        }
        else if (symbol_code >= 97 && symbol_code <= 119) {// lowecase letter team 1
            // use background grass
            tile = Terrain.GRASS;
            team = 1;
            type = "player";
            atlas = this.tileGrass[0];
            tiledim = 32;
        }
        else { // terrains
            type = "terrain";
            switch(symbol) {
                case ".":
                    tile = Terrain.GRASS;
                    atlas = this.tileGrass[(col+row*col) % this.tileGrass.length]; // maybe random with a seed?
                    tiledim = 32;
                    type = "grass"
                    break;
                case "#":
                    tile = Terrain.WALL;
                    atlas = this.tileWall[(col+row*col) % this.tileWall.length]; // maybe random with a seed?
                    tiledim = 32;
                    type = "wall"
                    break;
                case "~":
                    tile = Terrain.RIVER;
                    atlas = this.tileRiver;
                    tiledim = 32;
                    type = "river"
                    break;
                case "@":
                    tile = Terrain.OCEAN;
                    atlas = this.tileOcean;
                    tiledim = 32;
                    type = "ocean";
                    break;
                case "!":
                    tile = Terrain.GRASS;
                    atlas = this.tileGrass[0];
                    type = "trap"
                    tiledim = 32;
                    break;
                case "$":
                    tile = Terrain.GRASS;
                    atlas = this.tileGrass[0];
                    type = "recharge"
                    tiledim = 32;
                    break;
                case "&":
                    tile = Terrain.GRASS;
                    atlas = this.tileGrass[0];
                    type = "barrier"
                    tiledim = 32;
                    break;
                default:
                    console.debug("ERROR map symbol: " + x)
                    break;
            }
        }
        // return correct position in tilemap and the atlas
        return [atlas, tile, tiledim, symbol, team, type]
    };

    _initCanvasSize() {
        // Lookup the size the browser is displaying the canvas.
        let displayWidth  = window.innerWidth//*0.90;
        let displayHeight = window.innerHeight//*0.90;

        if(model.world._map.cols == model.world._map.rows) { //SQUARE MAP
            displayWidth = displayHeight = Math.min(displayWidth, displayHeight);
        } else { // WIDE MAP
            displayWidth = displayHeight = Math.min(displayWidth/2, displayHeight);
        }
        // map fit all the screen
        this._tsizeMap = Math.floor(displayHeight / model.world._map.rows)
        this.ctx.canvas.width  = this._tsizeMap * model.world._map.cols;
        this.ctx.canvas.height = this._tsizeMap * model.world._map.rows;
    }

    renderMap() {
        if (model.world._imageLoaded && model.world._map != undefined) {
            if (!model.world._initSize) {
                this._initCanvasSize();
                model.world._initSize = true;
            }
            if(model.needRefresh()) {
                // console.debug("REFRESHING MAP")
                this._drawMap();
                this._drawTraps();
                this._drawPlayers();
                this._drawShoots();
                this._drawPathfinding();
                this._drawPlayerNames();
                this._drawDieing();
                if(model.world.showMinimap)
                    this._drawMinimap();
                model.stopRefreshMap();
            }
        };
        window.requestAnimationFrame(this.renderMap.bind(this));
    };


    _drawDieing() {
        let dieing = model.dieing;
        let tiledim = 64;
        let cnt_pop = 0;
        for (let i=0; i<dieing.length; i++) {
            let death = dieing[i];
            if(death.cnt<0){ cnt_pop++; break; }
            let who_die = model.status.pl_list[death.name];
            let x = who_die.x;
            let y = who_die.y;
            let tile;

            let atlases = [];
            atlases.push(this.tilePlayerRed);
            atlases.push(this.tilePlayerBlue);
            let atlas;

            let anims = [];
            anims.push(Terrain.PLAYER_RED_DIE);
            anims.push(Terrain.PLAYER_BLUE_DIE);

            if (death.cnt > 0) {
                // console.debug("drawing shoots: " + x +", " + " " + direction + " " + counter);
                // choose tile
                
                let frame = anims[who_die.team].length - death.cnt;
                tile = anims[who_die.team][frame];
                atlas = atlases[who_die.team];

                this.ctx.drawImage(
                    atlas, // image
                    tile[0] * tiledim, // source x
                    tile[1] * tiledim, // source y
                    tiledim, // source width
                    tiledim, // source height
                    x * this._tsizeMap,  // target x
                    y * this._tsizeMap, // target y
                    this._tsizeMap, // target width
                    this._tsizeMap // target height
                );
                dieing[i].cnt--;  // TODO terrible modify the model
            }
        }
        while(cnt_pop>0){
            dieing.shift();
            cnt_pop--;
        }
        model.dieing = dieing;
    }



    _drawMinimap() {
        this.ctx.save();
        this.ctx.setTransform(1,0,0,1,0,0);
        let map = model.world._map;
        let dimMinimap;
        // if(map.cols == 128)
        //     dimMinimap = Math.floor(.30 * this.ctx.canvas.width) // .10 128x128
        // else if(map.cols == 64)
        //     dimMinimap = Math.floor(.30 * this.ctx.canvas.width) // .10 128x128
        // else
        dimMinimap = Math.floor(.30 * this.ctx.canvas.width) // .10 128x128

        let dimSquare = dimMinimap/map.cols;
        let alpha = 0.6;
        let minimapSize = {x: map.cols*dimSquare, y: map.rows*dimSquare}

        let startX = this.ctx.canvas.width - minimapSize.x - 5 // TODO this._tsizeMap
        let startY = this.ctx.canvas.height - minimapSize.y - 5 // TODO

        this.ctx.beginPath();
        // draw minimap borders
        this.ctx.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";
        this.ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";

        this.ctx.rect(startX, startY, minimapSize.x, minimapSize.y);
        this.ctx.stroke();

        for (let c = 0; c < map.cols; c++) {
            for (let r = 0; r < map.rows; r++) {
                let [atlas, tile, tiledim, symbol, team, type] = this._getTile(c, r); // TODO do not draw players!
                switch(type) {
                    case "player":
                        this.ctx.beginPath();
                        let player = model.findPlayerBySymbol(symbol);
                        let myName = model.status.me.name;
                        if(player != undefined && myName != undefined && player.name == myName) {
                            this.ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")"
                            this.ctx.strokeStyle = "rgba(255, 255, 255, " + alpha + ")";

                        } else {
                            switch(team) {
                                case 0:
                                    this.ctx.strokeStyle = "rgba(255, 0, 0, " + alpha + ")";
                                    this.ctx.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
                                    break;
                                case 1:
                                    this.ctx.strokeStyle = "rgba(0, 0, 255, " + alpha + ")";
                                    this.ctx.fillStyle = "rgba(0, 0, 255, " + alpha + ")";
                                    break;
                            }
                        }
                        this.ctx.fillRect(startX + c*dimSquare, startY + r*dimSquare, dimSquare, dimSquare);
                        this.ctx.stroke();
                        break;

                    case "flag":
                        this.ctx.beginPath();
                        switch(team) {
                            case 0:
                                this.ctx.strokeStyle = "rgba(255, 0, 0, " + alpha + ")";
                                this.ctx.fillStyle = "rgba(255, 0, 0, " + alpha + ")";
                                break;
                            case 1:
                                this.ctx.strokeStyle = "rgba(0, 0, 255, " + alpha + ")";
                                this.ctx.fillStyle = "rgba(0, 0, 255, " + alpha + ")";
                                break;
                        }
                        this.ctx.rect(startX + c*dimSquare, startY + r*dimSquare, dimSquare, dimSquare);
                        this.ctx.stroke();

                        break;

                    case "wall":
                        this.ctx.beginPath();
                        this.ctx.fillStyle =  "rgba(128, 128, 128, " + alpha + ")";
                        this.ctx.strokeStyle =  "rgba(128, 128, 128, " + alpha + ")";
                        this.ctx.fillRect(startX + c*dimSquare, startY + r*dimSquare, dimSquare, dimSquare);
                        this.ctx.stroke();
                        break;
                    case "ocean":
                        this.ctx.beginPath();
                        this.ctx.fillStyle =  "rgba(173, 216, 230, " + alpha + ")";
                        this.ctx.strokeStyle =  "rgba(173, 216, 230, " + alpha + ")";
                        this.ctx.fillRect(startX + c*dimSquare, startY + r*dimSquare, dimSquare, dimSquare);
                        this.ctx.stroke();
                        break;
                    default:
                        break;;
                }
            }
        }
        this.ctx.restore();
    };

    _drawMap() {
        let map = model.world._map;
        let showGrid = model.world.showGrid;

        // let tsizeMap = Math.floor(this.ctx.canvas.height / this._N)
        model.world.tmp_players = [];
        model.world.tmp_objects = [];

        if(model.world.lowResolutionMap) {
                // draw green background
            // this.ctx.beginPath();
            this.ctx.fillStyle = "green"  
            this.ctx.fillRect(0, 
                            0, 
                            this._tsizeMap * map.cols,
                            this._tsizeMap * map.rows);
            // this.ctx.stroke();
        } else {
            // draw background highres map 
            // this.ctx.fillStyle = this.grassPattern;
            // this.ctx.fillRect(0, 
            //                 0, 
            //                 this._tsizeMap * map.cols,
            //                 this._tsizeMap * map.rows);

            this.ctx.drawImage(this.tileGrassPattern, // image
                0, // source x
                0, // source y
                1600, // source width
                1600, // source height
                0, // source x
                0, // source y
                this._tsizeMap * map.cols,
                this._tsizeMap * map.rows
            );

        }

        for (let c = 0; c < map.cols; c++) {
            for (let r = 0; r < map.rows; r++) {
                let [atlas, tile, tiledim, symbol, team, type] = this._getTile(c, r); // TODO do not draw players!

                if(model.world.lowResolutionMap) {
                    switch(type) {    
                        case "wall":
                            // this.ctx.beginPath();
                            this.ctx.fillStyle = "#464E51"  
                            this.ctx.fillRect(c * this._tsizeMap, 
                                            r * this._tsizeMap, 
                                            this._tsizeMap,
                                            this._tsizeMap);
                            // this.ctx.stroke();
                            break;

                        case "ocean":
                            // this.ctx.beginPath();
                            this.ctx.fillStyle = "blue"  
                            this.ctx.fillRect(c * this._tsizeMap, 
                                            r * this._tsizeMap, 
                                            this._tsizeMap,
                                            this._tsizeMap);
                            // this.ctx.stroke();
                            break;
                            
                        case "river":
                            // this.ctx.beginPath();
                            this.ctx.fillStyle = "#00BFFF"  
                            this.ctx.fillRect(c * this._tsizeMap, 
                                            r * this._tsizeMap, 
                                            this._tsizeMap,
                                            this._tsizeMap);
                            // this.ctx.stroke();
                            break;

                        default:
                            break;
                    } 
                } else {
                    if(type == "river" || type == "wall" || type == "ocean") {
                        this.ctx.drawImage(atlas, // image
                                            tile[0] * tiledim, // source x
                                            tile[1] * tiledim, // source y
                                            tiledim, // source width
                                            tiledim, // source height
                                            c * this._tsizeMap,  // target x
                                            r * this._tsizeMap, // target y
                                            this._tsizeMap, // target width
                                            this._tsizeMap // target height
                                        );
                    }
                }

                if(showGrid) {
                    this.ctx.beginPath();

                    this.ctx.rect(
                        c * this._tsizeMap,  // target x
                        r * this._tsizeMap, // target y
                        this._tsizeMap, // target width
                        this._tsizeMap // target height
                        );

                    this.ctx.stroke();
                    }
                if (type === "player") {
                    model.world.tmp_players.push([symbol, team, c, r]);
                } else if (type === "trap" || type === "barrier" || type === "recharge" || type === "flag") {
                    model.world.tmp_objects.push([type, c, r, team]);
                }
            }
        }
    }

    _drawTraps() {
        let map = model.world._map;
        let tile;
        let atlas;
        let tiledim;

        model.world.tmp_objects.forEach( (trap) => {
                            let [type, c, r, team] = trap;
                            if (type === "trap") {
                                tile = Terrain.TRAP;
                                atlas = this.tileTrap;
                                tiledim = 32;
                            }
                            else if (type === "barrier") {
                                tile = Terrain.BARRIER;
                                atlas = this.tileBarrier;
                                tiledim = 32;
                            }
                            else if (type === "recharge") {
                                tile = Terrain.RECHARGE;
                                atlas = this.tileRecharge;
                                tiledim = 32;
                            } else if (type === "flag") {
                                if(team == 0) {
                                    if (model.status.state == "LOBBY") { // help user to find flags context.arc(x,y,r,sAngle,eAngle,counterclockwise);
                                        this.ctx.beginPath();
                                        let radius =  2*(this._tsizeMap)
                                        let cx = c * this._tsizeMap + this._tsizeMap /2
                                        let cy = r * this._tsizeMap + this._tsizeMap /2
                                        this.ctx.arc(cx, cy, radius, 0, 2*Math.PI);
                                        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'
                                        this.ctx.fill();
                                        this.ctx.lineWidth = 1;
                                        // this.ctx.stroke();
                                    } else { // help user to find flags context.arc(x,y,r,sAngle,eAngle,counterclockwise);
                                        this.ctx.beginPath();
                                        let radius =  (this._tsizeMap)
                                        let cx = c * this._tsizeMap + this._tsizeMap /2
                                        let cy = r * this._tsizeMap + this._tsizeMap /2
                                        this.ctx.arc(cx, cy, radius, 0, 2*Math.PI);
                                        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'
                                        this.ctx.fill();
                                        this.ctx.lineWidth = 1;
                                        // this.ctx.stroke();
                                    }
                                    tile = Terrain.FLAG_RED;
                                    atlas = this.tileFlagRed;
                                    tiledim = 32;
                                } else {
                                    if (model.status.state == "LOBBY") { // help user to find flags context.arc(x,y,r,sAngle,eAngle,counterclockwise);
                                        this.ctx.beginPath();
                                        let radius =  2*(this._tsizeMap)
                                        let cx = c * this._tsizeMap + this._tsizeMap /2
                                        let cy = r * this._tsizeMap + this._tsizeMap /2
                                        this.ctx.arc(cx, cy, radius, 0, 2*Math.PI);
                                        this.ctx.fillStyle = 'rgba(0, 0, 255, 0.4)'
                                        this.ctx.fill();
                                        this.ctx.lineWidth = 1;
                                        // this.ctx.stroke();
                                    } else { // help user to find flags context.arc(x,y,r,sAngle,eAngle,counterclockwise);
                                        this.ctx.beginPath();
                                        let radius =  (this._tsizeMap)
                                        let cx = c * this._tsizeMap + this._tsizeMap /2
                                        let cy = r * this._tsizeMap + this._tsizeMap /2
                                        this.ctx.arc(cx, cy, radius, 0, 2*Math.PI);
                                        this.ctx.fillStyle = 'rgba(0, 0, 255, 0.4)'
                                        this.ctx.fill();
                                        this.ctx.lineWidth = 1;
                                        // this.ctx.stroke();
                                    }
                                    tile = Terrain.FLAG_BLUE;
                                    atlas = this.tileFlagBlue;
                                    tiledim = 32;
                                }
                            }

                            this.ctx.drawImage(
                                atlas, // image
                                tile[0] * tiledim, // source x
                                tile[1] * tiledim, // source y
                                tiledim, // source width
                                tiledim, // source height
                                c * this._tsizeMap,  // target x
                                r * this._tsizeMap, // target y
                                this._tsizeMap, // target width
                                this._tsizeMap // target height
                            );
                        });
    }

    _drawPlayers() {
        let tile;
        let atlas;
        let tiledim;
        let pl_directions = model.pl_directions;
        model.world.tmp_players.forEach( (map_pl) => {
                        let [symbol, team, c, r] = map_pl;
                        let pl = model.findPlayerBySymbol(symbol);
                        if(pl != undefined) {
                            let state = pl.state;
                            let direction = pl_directions[pl.name];

                            if (state == "KILLED") {
                                tile = (team == 0 ? Terrain.PLAYER_RED_KILLED : Terrain.PLAYER_BLUE_KILLED);
                                atlas = this.tileGraves;
                                tiledim = 32;
                            } else {
                                // compute tile direction
                                switch(direction) {
                                    case "E": tile = Terrain.PLAYER_RED[0]; break;
                                    case "W": tile = Terrain.PLAYER_RED[1]; break;
                                    case "N": tile = Terrain.PLAYER_RED[2]; break;
                                    case "S": tile = Terrain.PLAYER_RED[3]; break;
                                    default:  tile = Terrain.PLAYER_RED[3]; break;
                                }
                                if (team == 0) {
                                    atlas = this.tilePlayerRed;
                                    tiledim = 64;
                                } else {
                                    atlas = this.tilePlayerBlue;
                                    tiledim = 64;
                                }
                            }

                            this.ctx.drawImage(
                                atlas, // image
                                tile[0] * tiledim, // source x
                                tile[1] * tiledim, // source y
                                tiledim, // source width
                                tiledim, // source height
                                c * this._tsizeMap,  // target x
                                r * this._tsizeMap, // target y
                                this._tsizeMap, // target width
                                this._tsizeMap // target height
                            );
                        }
                        });
    }

    _drawPlayerNames() {
        for (let i=0; i<model.world.tmp_players.length; i++) {
            let [symbol, team, c, r] = model.world.tmp_players[i];
            // let this._tsizeMap = Math.floor(this.ctx.canvas.height / this._N)

            let player = model.findPlayerBySymbol(symbol);
            let me_symbol = model.status.me.symbol;
            if (typeof player !== 'undefined') {
                // draw backroung character:
                if (team == 0) {
                    if (typeof me_symbol !== 'undefined' && model.status.me.symbol.localeCompare(symbol) == 0) {
                        this.ctx.font = '16px Arial'
                        this.ctx.fillStyle = model.teamColors.mePlayer;
                    } else {
                        this.ctx.font = '16px Arial'
                        this.ctx.fillStyle = model.teamColors.teamA;
                    }
                } else {
                    if (typeof me_symbol !== 'undefined' && model.status.me.symbol.localeCompare(symbol) == 0) {
                        this.ctx.font = '16px Arial'
                        this.ctx.fillStyle = model.teamColors.mePlayer;
                    } else {
                        this.ctx.font = '16px Arial'
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
        let map = model.world._map;
        let tiledim = 32;
        for (let i=0; i<shoots.length; i++) {
            let shoot = shoots[i];
            let x = shoot.x;
            let y = shoot.y;
            let direction = shoot.direction;
            let counter = shoot.counter;
            let tile;
            let atlas;
            if (counter > 0) {
                // console.debug("drawing shoots: " + x +", " + " " + direction + " " + counter);
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
                    tile[0] * tiledim, // source x
                    tile[1] * tiledim, // source y
                    tiledim, // source width
                    tiledim, // source height
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
        let tiledim = 32;
        for (let i=0; i<path.length; i++) {
            let x = path[i].x;
            let y = path[i].y;
            let counter = path[i].counter;
            let tile = Terrain.PATHFINDING;
            let atlas = this.tilePathfinding;
            if (counter > 0) {
                this.ctx.drawImage(
                    atlas, // image
                    tile[0] * tiledim, // source x
                    tile[1] * tiledim, // source y
                    tiledim, // source width
                    tiledim, // source height
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
            if (!model.getRendering()) {
                window.requestAnimationFrame(this.renderMap.bind(this));
                model.setRendering(true);
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
            this._loadImage('grass', this.imgGrassPattern),
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

