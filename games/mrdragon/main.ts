namespace game {

    export class GameVM {
        constructor(rawLevels: string[]) {
            this.currentLevel.subscribe(level => {
                this.levelMap.load(rawLevels[level]);
                this.player.x(this.levelMap.playerStartX());
                this.player.y(this.levelMap.playerStartY());
            });
            this.currentLevel(0);

            this.player.move = (dx, dy) => {
                this.player.x(this.player.x() + dx);
                this.player.y(this.player.y() + dy);
            };
        }

        livesRemaining = ko.observable(3);

        currentLevel = ko.observable<number>(null);

        levelMap = new LevelMapVM();

        jewelsCollected = ko.observable(0);

        keysCollected = ko.observable(0);

        player = {
            x: ko.observable(0),
            y: ko.observable(0),
            move: <(dx: number, dy: number) => void> null
        };
    }


    export class LevelMapVM {
        load(rawLevel: string) {

            // Split raw string into rows, and remove blank rows if any.
            var rows = rawLevel.split(/\r?\n/).filter(row => row.length > 0);
            while (!rows[rows.length - 1]) rows.pop();
    
            // Find the length of the longest row, and pad all rows to that length.
            var longestRow = rows.reduce((longest, row) => row.length > longest ? row.length : longest, 0);
            rows.forEach(row => {
                var padding = longestRow - row.length;
                for (var j = 0; j < padding; ++j) row += ' ';
            });
    
            // Build up the 'cells' structure. Locate the player along the way.
            var cells = [];
            rows.forEach((row, y) => {
                var playerX = row.indexOf('P');
                if (playerX !== -1) {
                    this.playerStartX = ko.observable(playerX);
                    this.playerStartY = ko.observable(y);
                    row = row.replace('P', ' ');
                }
                cells.push(ko.observableArray(row.split('')));
            });
    
            // Set instance properties.
            this.width = ko.observable(longestRow);
            this.height = ko.observable(rows.length);
            this.cells = ko.observable(cells);
        }

		width: KnockoutObservable<number>;

		height: KnockoutObservable<number>;

		cells: KnockoutObservable<Array<KnockoutObservableArray<string>>>;

        playerStartX: KnockoutObservable<number>;

        playerStartY: KnockoutObservable<number>;
    }
}
