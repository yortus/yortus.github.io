﻿// Set initial game state.
levels = []; // : { map: string, width: number; height: number; }
currentLevel = 0;
lives = 3;


// Start the game when the page has loaded.
$(document).ready(function () {
    parseLevelMaps();
    showCurrentLives();
    loadCurrentLevel();
    enableGamepad();
    startGameLoop();
    $('#credits-show').click(function() { $('#credits-popup').show(); });
    $('#credits-hide').click(function() { $('#credits-popup').hide(); });
});


function parseLevelMaps() {
    var rawLevelMaps = $('#level-maps').text();
    var rawLevels = rawLevelMaps.split(/L[0-9]+[ ]*\r?\n/).slice(1);
    for (var i = 0; i < rawLevels.length; ++i) {
        var rawLevel = rawLevels[i];
        var lines = rawLevel.split(/\r?\n/);
        while (!lines[lines.length - 1]) lines.pop();
        var longestLine = 0;
        for (var j = 0; j < lines.length; ++j) {
            if (lines[j].length > longestLine) longestLine = lines[j].length;
        }
        for (var j = 0; j < lines.length; ++j) {
            var padding = longestLine - lines[j].length;
            for (var k = 0; k < padding; ++k) lines[j] += ' ';
        }
        levels[i] = {
            width: longestLine,
            height: lines.length,
            map: lines.join('\n')
        };
    }
}


var gamepad = {
    UP: { isDown: false },
    DOWN: { isDown: false },
    LEFT: { isDown: false },
    RIGHT: { isDown: false }
}


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


function loadCurrentLevel() {

    // Show the current level in the titlebar.
    $('#level').text(currentLevel + 1);

    // Create all divs for maze rows and cells.
    var level = levels[currentLevel];
    var mazeHTML = '<div id="player"></div>';
    for (var y = 0; y < level.height; ++y) {
        var row = '<div class="row">';
        for (var x = 0; x < level.width; ++x) {
            var id = 'c-' + x + '-' + y;
            var cell = '<div id="' + id + '" class="cell"></div>';
            row += cell;
        }
        row += '</div>';
        mazeHTML += row;
    }
    $('#cave')
    .html(mazeHTML)
    .width(32 * level.width)
    .height(32 * level.height);

    // TODO: temp testing... generalise this depending on factors
    $('#cave-outer').scrollTop(256).scrollLeft(256);

    // Get the text for the level's map.
    var mazeText = level.map;
    var rows = mazeText.split('\n');

    // 'Draw' the level using CSS classes.
    for (var y = 0; y < level.height; ++y) {
        var row = rows[y];
        for (var x = 0; x < level.width; ++x) {
            var id = '#c-' + x + '-' + y;

            var cell = row.charAt(x);
            switch (cell) {
                case '#': $(id).addClass('rocks'); break;
                case 'P': player.x = x; player.y = y; break;
            }
        }
    }
}


function startGameLoop() {
    setTimeout(update, 100);
}


var player = {
    x: 1,
    y: 1,
    move: function(dx, dy) {
        var x = player.x = player.x + dx;
        var y = player.y = player.y + dy;
        var left = (x * 32) + 'px';
        var top = ((y - 1) * 32) + 'px';
        $('#player').css({ 'margin-left': left, 'margin-top': top});
    }
}


function isRocksAt(x, y) {
    var id = '#c-' + x + '-' + y;
    return $(id).hasClass('rocks');
}


function update() {

    // Move/draw player
    var UP = kd.UP.isDown() || gamepad.UP.isDown;
    var DOWN = kd.DOWN.isDown() || gamepad.DOWN.isDown;
    var LEFT = kd.LEFT.isDown() || gamepad.LEFT.isDown;
    var RIGHT = kd.RIGHT.isDown() || gamepad.RIGHT.isDown;
    var dx = LEFT ? -1 : RIGHT ? 1 : 0;
    var dy = UP ? -1 : DOWN ? 1 : 0;
    if (isRocksAt(player.x + dx, player.y + dy)) {
        if (dx != 0 && dy != 0) {
            if (!isRocksAt(player.x + dx, player.y))        dy = 0;
            else if (!isRocksAt(player.x, player.y + dy))   dx = 0;
            else                                            dx = dy = 0;
        }
        else {
            dx = dy = 0;
        }
    }
    player.move(dx, dy);
    if ((player.x > 6 && dx > 0) || (player.x < (levels[currentLevel].width - 6) && dx < 0)) {
        $('#cave-outer').scrollLeft($('#cave-outer').scrollLeft() + dx * 32);
    }
    if ((player.y > 6 && dy > 0) || (player.y < (levels[currentLevel].height - 6) && dy < 0)) {
        $('#cave-outer').scrollTop($('#cave-outer').scrollTop() + dy * 32);
    }
    dx = dy = 0;

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


function showCurrentLives() {
    for (var i = 1; i <= 3; ++i) {
        var id = '#life' + i;
        if (lives >= i) $(id).show(); else $(id).hide();
    }
}
