var Canvas = document.querySelector("canvas");

Canvas.width = window.innerWidth;
Canvas.height = window.innerHeight;

var Context = Canvas.getContext("2d");

let lastTimestamp = 1;
let deltaTime = 0;

Up = false;
Down = false;
Right = false;
Left = false;

document.addEventListener('keydown', function (event) {
    if (event.key === 'w') {
        Up = true;
    }
    if (event.key === 's') {
        Down = true;
    }
    if (event.key === 'd') {
        Right = true;
    }
    if (event.key === 'a') {
        Left = true;
    }
});
document.addEventListener('keyup', function (event) {
    if (event.key === 'w') {
        Up = false;
    }
    if (event.key === 's') {
        Down = false;
    }
    if (event.key === 'd') {
        Right = false;
    }
    if (event.key === 'a') {
        Left = false;
    }
});



PlayerPosX = innerWidth / 2;
PlayerPosY = innerHeight / 2;
PlayerWidth = 100;
PlayerHeight = 100;
PlayerSpeed = 200;
//this.Color = `rgb(${R},${G},${B})`;
function PlayerDraw() {
    if (Up) {
        PlayerPosY -= PlayerSpeed * deltaTime;
    }
    if (Down) {
        PlayerPosY += PlayerSpeed * deltaTime;
    }
    if (Right) {
        PlayerPosX += PlayerSpeed * deltaTime;
    }
    if (Left) {
        PlayerPosX -= PlayerSpeed * deltaTime;
    }

    if (PlayerPosY + PlayerHeight >= innerHeight) {
        PlayerPosY = innerHeight - PlayerHeight
    }
    else if (PlayerPosY <= 0) {
        Player2PosY = 0
    }

    Context.fillRect(PlayerPosX, PlayerPosY, PlayerWidth, PlayerHeight);
    Context.fillStyle = "Red";
    Context.fill();
}




function MoveObj(timestamp) {

    deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;


    Context.clearRect(0, 0, innerWidth, innerHeight)

    PlayerDraw()

    requestAnimationFrame(MoveObj);
}

MoveObj();
