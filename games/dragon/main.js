var game;
(function (game) {
    var GameVM = (function () {
        function GameVM(rawLevels) {
            var _this = this;
            this.livesRemaining = ko.observable(3);
            this.currentLevel = ko.observable(null);
            this.levelMap = new LevelMapVM();
            this.jewelsCollected = ko.observable(0);
            this.keysCollected = ko.observable(0);
            this.player = {
                x: ko.observable(0),
                y: ko.observable(0),
                move: null
            };
            this.currentLevel.subscribe(function (level) {
                _this.levelMap.load(rawLevels[level]);
                _this.player.x(_this.levelMap.playerStartX());
                _this.player.y(_this.levelMap.playerStartY());
            });
            this.currentLevel(0);
            this.player.move = function (dx, dy) {
                _this.player.x(_this.player.x() + dx);
                _this.player.y(_this.player.y() + dy);
            };
        }
        return GameVM;
    })();
    game.GameVM = GameVM;
    var LevelMapVM = (function () {
        function LevelMapVM() {
        }
        LevelMapVM.prototype.load = function (rawLevel) {
            var _this = this;
            // Split raw string into rows, and remove blank rows if any.
            var rows = rawLevel.split(/\r?\n/).filter(function (row) { return row.length > 0; });
            while (!rows[rows.length - 1])
                rows.pop();
            // Find the length of the longest row, and pad all rows to that length.
            var longestRow = rows.reduce(function (longest, row) { return row.length > longest ? row.length : longest; }, 0);
            rows.forEach(function (row) {
                var padding = longestRow - row.length;
                for (var j = 0; j < padding; ++j)
                    row += ' ';
            });
            // Build up the 'cells' structure. Locate the player along the way.
            var cells = [];
            rows.forEach(function (row, y) {
                var playerX = row.indexOf('P');
                if (playerX !== -1) {
                    _this.playerStartX = ko.observable(playerX);
                    _this.playerStartY = ko.observable(y);
                    row = row.replace('P', ' ');
                }
                cells.push(ko.observableArray(row.split('')));
            });
            // Set instance properties.
            this.width = ko.observable(longestRow);
            this.height = ko.observable(rows.length);
            this.cells = ko.observable(cells);
        };
        return LevelMapVM;
    })();
    game.LevelMapVM = LevelMapVM;
})(game || (game = {}));
