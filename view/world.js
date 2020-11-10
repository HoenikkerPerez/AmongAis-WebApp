
//Terrain types
// .  grass, freely walkable, allow shooting
// #  wall, not walkable, stops shoots
// ~  river, walkable, cannot shoot while on it, allow shooting through it
// @  ocean, not walkable, allow shooting through it
// !  trap, will subtract energy from player if walked on, allow shooting through it

class WorldUi {
    GRASS = [19,7]
    WALL = [1,0];
    RIVER = [4,0];
    OCEAN = [3,4];
    TRAP = [4,1];
    FLAG = [0,0];

    imgTileSet = './assets/maptiles.bmp'    
    
    N = 32 // map size NxN

    images = {}

    constructor() {
        console.debug("RENDER STARTED");
        var p = this._loads();
        Promise.all(p).then(function (loaded) {
            this.tileAtlas = this._getImage(_getImage('tiles'));
        }.bind(this));

        // this.map = new Map(this, model.map_name);
    };

    _load() {
        // Listeners for UI
        this._loadWsMessages();
    };

    _get_tile(col, row) {
        map = model.map;
        idx = row * map.cols + col;
        x = this.tiles[idx];
        var tile;
        var team = -1;
        xcode = x.charCodeAt(0);
        if (xcode == 88) { // X: team A flag
            tile = FLAG;
            team = 0;
        }
        else if (xcode == 120) { // x: team B flag
            tile = FLAG;
            team = 1;
        }        
        else if(xcode >= 65 && xcode <= 84) {  // uppercase letter team 0
            tile = [19,7];
            team = 0;
        }
        else if (xcode >= 97 && xcode <= 116) {// lowecase letter team 1
            tile = [19,7];
            team = 1;
        }
        else { // terrains
            switch(x) {
                case ".":
                    tile = GRASS;
                    break;
                case "#":
                    tile = WALL;
                    break;
                case "~":
                    tile = RIVER;
                    break;
                case "@":
                    tile = OCEAN;
                    break;
                case "!":
                    tile = TRAP;
                    break;
                default:
                    console.log("ERROR map symbol: " + x)
                    break;
            }
            x = "0";
        }
        // return correct position in tilemap and the atlas
        return [tile, x, team]
    };


    renderMap() {
        let map = model.map;
        for (let c = 0; c < map.cols; c++) {
            for (let r = 0; r < map.rows; r++) {
                let [tile, x, team] = this._getTile(c, r);
                if (tile !== (0,0)) { // 0 => empty tile
                    // draw backroung character:
                    if (team == 0) {
                        this.ctx.fillStyle = "#FF0000";
                        this.ctx.fillRect(c * this.tsizeMap, 
                            r * this.tsizeMap,
                            this.tsizeMap,
                            this.tsizeMap);
                    }
                    else if (team == 1) {
                        this.ctx.fillStyle = "#FFF000";
                        this.ctx.fillRect(c * this.tsizeMap, 
                            r * this.tsizeMap,
                            this.tsizeMap,
                            this.tsizeMap);
                    }
                    this.ctx.drawImage(
                        this.tileAtlas, // image
                        tile[0] * map.tsize, // source x
                        tile[1] * map.tsize, // source y
                        map.tsize, // source width
                        map.tsize, // source height
                        c * this.tsizeMap,  // target x
                        r * this.tsizeMap, // target y
                        this.tsizeMap, // target width
                        this.tsizeMap // target height
                    );
                    if (x !== "0") {
                        this.ctx.fillText(x, c * this.tsizeMap + 5, r * this.tsizeMap + 12);
                    }
                }
            }
        }
    }


    _loadWsMessages() {
        console.debug("WorldUi: _loadWsMessages");

        document.addEventListener("MODEL_SETMAP", () => {
            this.renderMap()
        }, false);
    }

    
    _loadImage = function (key, src) {
        var img = new Image();
    
        var d = new Promise(function (resolve, reject) {
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
            this.loadImage('tiles', imgTileSet)
        ];
    }.bind(this);
}









// const terrainSet = [GRASS, WALL, RIVER, OCEAN, TRAP];
// const mapSymbols = ["A", "a", "b", "c", "x", "X", ".", "@", "#", "~", "!"];
// var map = {
//     cols: N,
//     rows: N,
//     tsize: 32,
//     tiles: Array.from({length:N*N}, () => mapSymbols[Math.floor(Math.random() * mapSymbols.length)]),
// };



// Game.start = function (gameName, context) {
//     this.gameName = gameName
//     this.ctx = context;
//     this._startTime = new Date();
//     console.debug("RENDER STARTED");
//     var p = this.load();
//     Promise.all(p).then(function (loaded) {
//         this.init();
//         Game.loop()
//     }.bind(this));
// };


// Game.load = function () {
//     return [
//         Loader.loadImage('tiles', imgTileSet)
//     ];
// }.bind(this);

// Game.init = function () {
//     this.tileAtlas = Loader.getImage('tiles');
//     this.map = new Map(this, model.map_name);
// };


// Game.updatedMapHandler = function(evt) {
//     // On map update -> rerender the map
//     this.render
//     // parse map
//     // update model
// }.bind(this);


// //
// // start up function
// //

// // window.onload = function () {
// //     var context = document.getElementById('canvas').getContext('2d');
// //     Game.start(context);
// // };