//Terrain types
// .  grass, freely walkable, allow shooting
// #  wall, not walkable, stops shoots
// ~  river, walkable, cannot shoot while on it, allow shooting through it
// @  ocean, not walkable, allow shooting through it
// !  trap, will subtract energy from player if walked on, allow shooting through it





////// ---------------- TEST --------------
const WATER = [4,0]
const GRASS = [3,0]
const FLOOR = [2,0]

var map = {
    cols: 8,
    rows: 8,
    tsize: 32,
    tiles: [
        GRASS, WATER, WATER, WATER, GRASS, GRASS, WATER, GRASS,
        GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS,
        GRASS, GRASS, GRASS, GRASS, GRASS, FLOOR, GRASS, GRASS,
        GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS, GRASS,
        GRASS, GRASS, GRASS, FLOOR, GRASS, GRASS, GRASS, GRASS,
        GRASS, GRASS, GRASS, GRASS, FLOOR, GRASS, GRASS, GRASS,
        GRASS, GRASS, GRASS, GRASS, FLOOR, GRASS, GRASS, GRASS,
        GRASS, GRASS, GRASS, GRASS, FLOOR, GRASS, GRASS, GRASS
    ],
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

Game.mapPoller = function (elapsed) {
    window.requestAnimationFrame(this.mapPoller);
    loadRate = 0.25
    // clear previous map
    this.ctx.canvas.width = map.cols*32;
    this.ctx.canvas.height = map.rows*32;    
    this.ctx.clearRect(0, 0, map.cols, map.rows);

    var delta = (elapsed - this._previousElapsed) / 1000.0;
    delta = Math.min(delta, loadRate); // load map rate
    this._previousElapsed = elapsed;

    // update map 
    this.render(); 
}.bind(Game);

Game.run = function (context) {
    this.ctx = context;
    this._previousElapsed = 0;

    var p = this.load();
    Promise.all(p).then(function (loaded) {
        this.init();
        window.requestAnimationFrame(this.mapPoller);
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
                    tile[1], // source y
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
    Game.run(context);
};