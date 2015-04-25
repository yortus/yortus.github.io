// Set initial game state.
levels = [];
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
    var rawLevels = rawLevelMaps.split(/L[0-9]+/).slice(1);
    for (var i = 0; i < rawLevels.length; ++i) {
        var rawLevel = rawLevels[i];
        var lines = rawLevel.split('\n').slice(1, 41);
        for (var j = 0; j < lines.length; ++j) {
            lines[j] = lines[j].trim();
        }
        levels[i] = lines.join('\n');
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
    var mazeHTML = '<div id="player"></div>';
    for (var y = 0; y < 40; ++y) {
        var row = '<div class="row">';
        for (var x = 0; x < 40; ++x) {
            var id = 'c-' + x + '-' + y;
            var cell = '<div id="' + id + '" class="cell"></div>';
            row += cell;
        }
        row += '</div>';
        mazeHTML += row;
    }
    $('#maze').html(mazeHTML);

    // Get the text for the level's map.
    var mazeText = levels[currentLevel];
    var rows = mazeText.split('\n');

    // 'Draw' the level using CSS classes.
    for (var y = 0; y < 40; ++y) {
        var row = rows[y];
        for (var x = 0; x < 40; ++x) {
            var id = '#c-' + x + '-' + y;

            var cell = row.charAt(x);
            switch (cell) {
                case '#': $(id).addClass('wall'); break;
                case 'P': player.x = x; player.y = y; break;
                case 'T': $(id).addClass('treasure'); break;
                case 'H': $(id).addClass('hole'); break;
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
        var left = (x * 16) + 'px';
        var top = ((y - 1) * 16) + 'px';
        $('#player').css({ 'margin-left': left, 'margin-top': top});
    }
}


function isWallAt(x, y) {
    var id = '#c-' + x + '-' + y;
    return $(id).hasClass('wall');
}


function isTreasureAt(x, y) {
    var id = '#c-' + x + '-' + y;
    return $(id).hasClass('treasure');
}


function isHoleAt(x, y) {
    var id = '#c-' + x + '-' + y;
    return $(id).hasClass('hole');
}


function update() {

    // Move/draw player
    var UP = kd.UP.isDown() || gamepad.UP.isDown;
    var DOWN = kd.DOWN.isDown() || gamepad.DOWN.isDown;
    var LEFT = kd.LEFT.isDown() || gamepad.LEFT.isDown;
    var RIGHT = kd.RIGHT.isDown() || gamepad.RIGHT.isDown;
    var dx = LEFT ? -1 : RIGHT ? 1 : 0;
    var dy = UP ? -1 : DOWN ? 1 : 0;
    if (isWallAt(player.x + dx, player.y + dy)) {
        if (dx != 0 && dy != 0) {
            if (!isWallAt(player.x + dx, player.y))         dy = 0;
            else if (!isWallAt(player.x, player.y + dy))    dx = 0;
            else                                            dx = dy = 0;
        }
        else {
            dx = dy = 0;
        }
    }
    player.move(dx, dy);
    dx = dy = 0;

    // Fell in a hole?
    if (isHoleAt(player.x, player.y)) {

        // Player died!
        --lives;
        $('#maze').addClass('died');
        setTimeout(function () {
            if (lives <= 0) {

                // Player loses game!
                alert('Oh no! You lose the game!!! Better luck next time.');
                lives = 3;
                currentLevel = 0;
            }
            else {
                alert('Aaa! You lose a life!');
            }
            $('#maze').removeClass('died');
            showCurrentLives();
            loadCurrentLevel();
            startGameLoop();
        }, 1000);
    }

    // Found treasure?
    else if (isTreasureAt(player.x, player.y)) {

        // Player wins level!
        $('#player').addClass('wins');
        $('#maze').addClass('wins');

        setTimeout(function() {
            ++currentLevel;
            if (currentLevel >= levels.length) {

                // Player wins game!
                alert('YOU\'RE THE MAZE MAN CHAMPION!!!');
                currentLevel = 0;
            }
            $('#maze').removeClass('wins');
            loadCurrentLevel();
            startGameLoop();
        }, 2000);

    }

    // Nothing happened, keep playing....
    else {
        setTimeout(update, 100);
    }
}


function showCurrentLives() {
    for (var i = 1; i <= 3; ++i) {
        var id = '#life' + i;
        if (lives >= i) $(id).show(); else $(id).hide();
    }
}
