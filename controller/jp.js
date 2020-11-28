class PathFinder  {
    _map;

    // Taken steps
    closed= [];

    // Available steps that can be taken
    open= [];

    // Step count
    step= 0;

    // Maximum number of steps that can be taken before shutting down a closed path
    maxSearchDistance= 10;


    constructor(map) {
        this._map = map;
    }

    Step = function(xC, yC, xT, yT, totalSteps, parentStep) {
            // Manhattan distance (use this one)
        this.distanceM = function (xC, yC, xT, yT) {
            var dx = Math.abs(xT - xC), dy = Math.abs(yT - yC);
            return dx + dy;}

        // herustic
        var h = this.distanceM(xC, yC, xT, yT);
    
        this.x = xC;
        this.y = yC;
        this.g = totalSteps;
        this.h = h;
        this.f = totalSteps + h;
        this.parent = parentStep;
    };

    Tile = function (x, y) {
        this.x = x;
        this.y = y;
    };

    getNeighbors(map, x, y) {
        let outOfBounds = function(x, y) {
            return x < 0 || x >= map.cols ||
                y < 0 || y >= map.rows;
        }
        let blocked = function (x, y) {
            if (outOfBounds(x, y)) {
                return true;
            }
            let idx = x + y*map.rows;
            let tile = map.tiles[idx];
            if (tile == "#" || tile == "@" || tile == "!") {
                return true;
            }
            return false;
        };

        var neighbors = [];

        // Check left, right, top, bottom
        if (!blocked(x + 1, y)) neighbors.push(new this.Tile(x + 1, y));
        if (!blocked(x - 1, y)) neighbors.push(new this.Tile(x - 1, y));
        if (!blocked(x, y + 1)) neighbors.push(new this.Tile(x, y + 1));
        if (!blocked(x, y - 1)) neighbors.push(new this.Tile(x, y - 1));

        return neighbors;
    }

    getCost(map, x, y,  xT, yT) {
        return 1;
    }

    addOpen(step) {
        this.open.push(step);
        return this;
    }

    // Remove a step that already exists by object memory address (not actual x and y values)
    removeOpen(step) {
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i] === step) this.open.splice(i, 1);
        }
        return this;
    }

    // Check if the step is already in the open set
    inOpen(step) {
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i].x === step.x && this.open[i].y === step.y)
                return this.open[i];
        }

        return false;
    }


    // Get the lowest costing tile in the open set
    getBestOpen() {
        var bestI = 0;
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i].f < this.open[bestI].f) bestI = i;
        }

        return this.open[bestI];
    }

    addClosed(step) {
        this.closed.push(step);
        return this;
    }

    // Check if the step is already in the closed set
    inClosed(step) {
        for (var i = 0; i < this.closed.length; i++) {
            if (this.closed[i].x === step.x && this.closed[i].y === step.y)
                return this.closed[i];
        }

        return false;
    }


    findPath(xC, yC, xT, yT, maxSteps) {
        var current, // Current best open tile
            neighbors, // Dump of all nearby neighbor tiles
            neighborRecord, // Any pre-existing records of a neighbor
            stepCost, // Dump of a total step score for a neighbor
            i;

        // You must add the starting step
        this.reset()
            .addOpen(new this.Step(parseInt(xC), parseInt(yC), parseInt(xT), parseInt(yT), this.step, false));

        while (this.open.length !== 0) {
            current = this.getBestOpen();

            // Check if goal has been discovered to build a path
            if (current.x === xT && current.y === yT) {
                return this.buildPath(current, []);
            }

            // Move current into closed set
            this.removeOpen(current)
                .addClosed(current);

            // Get neighbors from the map and check them
            neighbors = this.getNeighbors(this._map, current.x, current.y);
            for (i = 0; i < neighbors.length; i++) {
                // Get current step and distance from current to neighbor
                stepCost = current.g + this.getCost(this._map, current.x, current.y, neighbors[i].x, neighbors[i].y);

                // Check for the neighbor in the closed set
                // then see if its cost is >= the stepCost, if so skip current neighbor
                neighborRecord = this.inClosed(neighbors[i]);
                if (neighborRecord && stepCost >= neighborRecord.g)
                    continue;

                // Verify neighbor doesn't exist or new score for it is better
                neighborRecord = this.inOpen(neighbors[i]);
                if (!neighborRecord || stepCost < neighborRecord.g) {
                    if (!neighborRecord) {
                        this.addOpen(new this.Step(neighbors[i].x, neighbors[i].y, xT, yT, stepCost, current));
                    } else {
                        neighborRecord.parent = current;
                        neighborRecord.g = stepCost;
                        neighborRecord.f = stepCost + neighborRecord.h;
                    }
                }
            }
        }

        return false;
    }


    // Recursive path buliding method
    buildPath(tile, stack) {
        stack.push(tile);

        if (tile.parent) {
            return this.buildPath(tile.parent, stack);
        } else {
            return stack;
        }
    }


    reset() {
        this.closed = [];
        this.open = [];
        return this;
    }
};