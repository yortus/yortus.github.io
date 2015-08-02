///<reference path="./typings/jquery/jquery.d.ts" />
///<reference path="./typings/knockout/knockout.d.ts" />
///<reference path="./main.ts" />
// Set initial game state.
var levels = []; // : { map: { [row: number]: { [col: number]: string; }; }, width: number; height: number; }
var currentLevel = 0;
var lives = 3;
var keys = 0;
var jewels = 0;
var cave = null;
var legend = {
    ' ': 'blank',
    '#': 'rocks',
    'K': 'key-gold',
    'D': 'door-gold',
    'V': 'diamond'
};
var gameVM;
// Start the game when the page has loaded.
$(document).ready(function () {
    var rawLevels = getRawLevels();
    gameVM = new game.GameVM(rawLevels);
    ko.applyBindings(gameVM);
    $('#cave-outer')
        .scrollTop(gameVM.levelMap.playerStartY() * 32 - 320)
        .scrollLeft(gameVM.levelMap.playerStartX() * 32 - 320);
    //$('#player')
    //    .css({ 'margin-left': gameVM.levelMap.playerStartX() * 32, 'margin-top': gameVM.levelMap.playerStartY() * 32});
    enableGamepad();
    startGameLoop();
    //    $('#credits-show').click(function() { $('#credits-popup').show(); });
    //    $('#credits-hide').click(function() { $('#credits-popup').hide(); });
});
function getRawLevels() {
    var rawLevelMaps = $('#level-maps').text();
    var rawLevels = rawLevelMaps.split(/L[0-9]+[ ]*\r?\n/).slice(1);
    return rawLevels;
}
var gamepad = {
    UP: { isDown: false },
    DOWN: { isDown: false },
    LEFT: { isDown: false },
    RIGHT: { isDown: false }
};
function enableGamepad() {
    $('#gamepad .up').on('mousedown touchstart', function (e) { gamepad.UP.isDown = true; e.preventDefault(); });
    $('#gamepad .up').on('mouseup mouseout touchend', function (e) { gamepad.UP.isDown = false; e.preventDefault(); });
    $('#gamepad .down').on('mousedown touchstart', function (e) { gamepad.DOWN.isDown = true; e.preventDefault(); });
    $('#gamepad .down').on('mouseup mouseout touchend', function (e) { gamepad.DOWN.isDown = false; e.preventDefault(); });
    $('#gamepad .left').on('mousedown touchstart', function (e) { gamepad.LEFT.isDown = true; e.preventDefault(); });
    $('#gamepad .left').on('mouseup mouseout touchend', function (e) { gamepad.LEFT.isDown = false; e.preventDefault(); });
    $('#gamepad .right').on('mousedown touchstart', function (e) { gamepad.RIGHT.isDown = true; e.preventDefault(); });
    $('#gamepad .right').on('mouseup mouseout touchend', function (e) { gamepad.RIGHT.isDown = false; e.preventDefault(); });
}
function startGameLoop() {
    setTimeout(update, 100);
}
function isRocksAt(x, y) {
    var p = gameVM.levelMap.cells()[y]()[x];
    return p === '#';
}
function isBlockedAt(x, y) {
    if (x < 0 || y < 0)
        return true;
    if (x >= gameVM.levelMap.width() || y >= gameVM.levelMap.height())
        return true;
    var p = gameVM.levelMap.cells()[y]()[x];
    return p === '#' || p === 'D';
}
function isKeyAt(x, y) {
    var p = gameVM.levelMap.cells()[y]()[x];
    return p === 'K';
}
function isDoorAt(x, y) {
    var p = gameVM.levelMap.cells()[y]()[x];
    return p === 'D';
}
function isDiamondAt(x, y) {
    var p = gameVM.levelMap.cells()[y]()[x];
    return p === 'V';
}
function update() {
    var level = levels[currentLevel];
    var player = gameVM.player;
    // Move/draw player
    var UP = kd.UP.isDown() || gamepad.UP.isDown;
    var DOWN = kd.DOWN.isDown() || gamepad.DOWN.isDown;
    var LEFT = kd.LEFT.isDown() || gamepad.LEFT.isDown;
    var RIGHT = kd.RIGHT.isDown() || gamepad.RIGHT.isDown;
    var dx = LEFT ? -1 : RIGHT ? 1 : 0;
    var dy = UP ? -1 : DOWN ? 1 : 0;
    // Hit door?
    if (isDoorAt(player.x() + dx, player.y() + dy)) {
        if (gameVM.keysCollected() > 0) {
            gameVM.keysCollected(gameVM.keysCollected() - 1);
            gameVM.levelMap.cells()[player.y() + dy].splice(player.x() + dx, 1, ' ');
        }
    }
    // Hit wall, door, etc?
    if (isBlockedAt(player.x() + dx, player.y() + dy)) {
        if (dx != 0 && dy != 0) {
            if (!isBlockedAt(player.x() + dx, player.y()))
                dy = 0;
            else if (!isBlockedAt(player.x(), player.y() + dy))
                dx = 0;
            else
                dx = dy = 0;
        }
        else {
            dx = dy = 0;
        }
    }
    player.move(dx, dy);
    if ((player.x() > 6 && dx > 0) || (player.x() < (gameVM.levelMap.width() - 6) && dx < 0)) {
        $('#cave-outer').scrollLeft($('#cave-outer').scrollLeft() + dx * 32);
    }
    if ((player.y() > 6 && dy > 0) || (player.y() < (gameVM.levelMap.height() - 6) && dy < 0)) {
        $('#cave-outer').scrollTop($('#cave-outer').scrollTop() + dy * 32);
    }
    dx = dy = 0;
    // Hit key?
    if (isKeyAt(player.x(), player.y())) {
        gameVM.keysCollected(gameVM.keysCollected() + 1);
        gameVM.levelMap.cells()[player.y()].splice(player.x(), 1, ' ');
    }
    // Hit diamond?
    if (isDiamondAt(player.x(), player.y())) {
        gameVM.jewelsCollected(gameVM.jewelsCollected() + 1);
        gameVM.levelMap.cells()[player.y()].splice(player.x(), 1, ' ');
    }
    //// Fell in a hole?
    //if (isHoleAt(player.x, player.y)) {
    //    // Player died!
    //    --lives;
    //    $('#cave').addClass('died');
    //    setTimeout(function () {
    //        if (lives <= 0) {
    //            // Player loses game!
    //            alert('Oh no! You lose the game!!! Better luck next time.');
    //            lives = 3;
    //            currentLevel = 0;
    //        }
    //        else {
    //            alert('Aaa! You lose a life!');
    //        }
    //        $('#cave').removeClass('died');
    //        showCurrentLives();
    //        loadCurrentLevel();
    //        startGameLoop();
    //    }, 1000);
    //}
    //// Found treasure?
    //else if (isTreasureAt(player.x, player.y)) {
    //    // Player wins level!
    //    $('#player').addClass('wins');
    //    $('#cave').addClass('wins');
    //    setTimeout(function() {
    //        ++currentLevel;
    //        if (currentLevel >= levels.length) {
    //            // Player wins game!
    //            alert('YOU\'RE THE CAVE MAN CHAMPION!!!');
    //            currentLevel = 0;
    //        }
    //        $('#cave').removeClass('wins');
    //        loadCurrentLevel();
    //        startGameLoop();
    //    }, 2000);
    //}
    // Nothing happened, keep playing....
    //else {
    setTimeout(update, 100);
    //}
}
