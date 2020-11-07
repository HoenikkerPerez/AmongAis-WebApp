//Terrain types
// .  grass, freely walkable, allow shooting
// #  wall, not walkable, stops shoots
// ~  river, walkable, cannot shoot while on it, allow shooting through it
// @  ocean, not walkable, allow shooting through it
// !  trap, will subtract energy from player if walked on, allow shooting through it





////// ---------------- TEST --------------
const GRASS = [19,7]// [3,0];
const WALL = [1,0];
const RIVER = [4,0];
const OCEAN = [3,4];
const TRAP = [4,1];
const FLAG = [0,0];

const imgTileSet = './assets/maptiles.bmp'

// const GRASS = [3,0];
// const WALL = [1,0];
// const RIVER = [4,0];
// const OCEAN = [3,4];
// const TRAP = [4,1];
// const imgTileSet = '../assets/32x32_map_tile.png'
const N = 32 // map size NxN
const terrainSet = [GRASS, WALL, RIVER, OCEAN, TRAP];
var map = {
    cols: N,
    rows: N,
    tsize: 32,
    tiles: Array.from({length:N*N}, () => terrainSet[Math.floor(Math.random() * terrainSet.length)]),

    getTile: function (col, row) {
        return this.tiles[row * map.cols + col];
    }
};

const mapSymbols = ["A", "a", "b", "c", "x", "X", ".", "@", "#", "~", "!"];
var map = {
    cols: N,
    rows: N,
    tsize: 32,
    tiles: Array.from({length:N*N}, () => mapSymbols[Math.floor(Math.random() * mapSymbols.length)]),

    getTile: function (col, row) {
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
    }
};

/////////// -----------------------------------------



//
// Asset loader
//

var Loader = {
    images: {}
};

Loader.loadImage = function (key, src) {
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

Loader.getImage = function (key) {
    return (key in this.images) ? this.images[key] : null;
};

////////////////////////////////


var Game = {};

Game.mapPoller = function () {
    loadRate = 0.25
    // Draw yellow background

    // clear previous map
    // this.ctx.canvas.width = map.cols*map.tsize;
    // this.ctx.canvas.height = map.rows*map.tsize; 

    this.ctx.canvas.width = 512;
    this.ctx.canvas.height = 512;   
    this.tsizeMap = this.ctx.canvas.height / N
    this.ctx.clearRect(0, 0, map.cols, map.rows);

    // update map 
    this.render(); 
}

Game.statusPoller = function () {}
Game.updateStatus = function () {}

Game.loop = function (elapsed) {
    window.requestAnimationFrame(this.loop);
    this.updateStatus();
    this.mapPoller();
    this.statusPoller();

    var delta = (elapsed - this._previousElapsed) / 1000.0;
    delta = Math.min(delta, loadRate); // load map rate
    this._previousElapsed = elapsed;
}.bind(Game); // avoid Losing “this”

Game.start = function (context) {
    this.ctx = context;
    this._previousElapsed = 0;

    var p = this.load();
    Promise.all(p).then(function (loaded) {
        this.init();
        window.requestAnimationFrame(this.loop);
    }.bind(this));
};


Game.load = function () {
    return [
        Loader.loadImage('tiles', imgTileSet)
    ];
};

Game.init = function () {
    this.tileAtlas = Loader.getImage('tiles');
};

Game.render = function () {
    // console.log("W:" + this.ctx.canvas.width)
    // console.log(this.ctx.canvas.height)
    // console.log(this.tsizeMap)
    for (var c = 0; c < map.cols; c++) {
        for (var r = 0; r < map.rows; r++) {
            var [tile, x, team] = map.getTile(c, r);
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
};

//
// start up function
//

// window.onload = function () {
//     var context = document.getElementById('canvas').getContext('2d');
//     Game.start(context);
// };