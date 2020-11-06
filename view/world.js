//Terrain types
// .  grass, freely walkable, allow shooting
// #  wall, not walkable, stops shoots
// ~  river, walkable, cannot shoot while on it, allow shooting through it
// @  ocean, not walkable, allow shooting through it
// !  trap, will subtract energy from player if walked on, allow shooting through it





////// ---------------- TEST --------------
const GRASS = [3,0];
const WALL = [1,0];
const RIVER = [4,0];
const OCEAN = [3,4];
const TRAP = [4,1];
const N = 64 // map size NxN

const tileSet = [GRASS, WALL, RIVER, OCEAN, TRAP];
var map = {
    cols: 8,
    rows: 8,
    tsize: 32,
    tiles: [
        GRASS, OCEAN, OCEAN, OCEAN, GRASS, GRASS, OCEAN, GRASS,
        GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS,
        GRASS, GRASS, TRAP, GRASS, GRASS, RIVER, GRASS, GRASS,
        GRASS, WALL, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS,
        GRASS, WALL, GRASS, RIVER, GRASS, GRASS, GRASS, GRASS,
        GRASS, WALL, WALL, WALL, RIVER, GRASS, GRASS, GRASS,
        GRASS, GRASS, GRASS, GRASS, RIVER, GRASS, GRASS, GRASS,
        GRASS, GRASS, GRASS, GRASS, RIVER, GRASS, GRASS, GRASS
    ],
    getTile: function (col, row) {
        return this.tiles[row * map.cols + col];
    }
};

var map = {
    cols: N,
    rows: N,
    tsize: 32,
    tiles: Array.from({length:N*N}, () => tileSet[Math.floor(Math.random() * tileSet.length)]),

    getTile: function (col, row) {
        return this.tiles[row * map.cols + col];
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
    this.ctx.canvas.width = map.cols*map.tsize;
    this.ctx.canvas.height = map.rows*map.tsize;    
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
        Loader.loadImage('tiles', '../assets/maptiles.bmp')
    ];
};

Game.init = function () {
    this.tileAtlas = Loader.getImage('tiles');
};

Game.render = function () {
    for (var c = 0; c < map.cols; c++) {
        for (var r = 0; r < map.rows; r++) {
            var tile = map.getTile(c, r);
            if (tile !== (0,0)) { // 0 => empty tile
                this.ctx.drawImage(
                    this.tileAtlas, // image
                    tile[0] * map.tsize, // source x
                    tile[1] * map.tsize, // source y
                    map.tsize, // source width
                    map.tsize, // source height
                    c * map.tsize,  // target x
                    r * map.tsize, // target y
                    map.tsize, // target width
                    map.tsize // target height
                );
            }
        }
    }
};

//
// start up function
//

window.onload = function () {
    var context = document.getElementById('canvas').getContext('2d');
    Game.start(context);
};