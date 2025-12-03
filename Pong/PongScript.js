var Canvas = document.querySelector("canvas");

Canvas.width = window.innerWidth;
Canvas.height = window.innerHeight;

var Context = Canvas.getContext("2d");
let lastTimestamp = 1;
let deltaTime = 0;

UpwardsP1 = false;
DownwardsP1 = false;
UpwardsP2 = false;
DownwardsP2 = false;

let Points1 = 0;
let Points2 = 0;

Round = 1;





window.addEventListener('resize',
    function () {
        Canvas.width = window.innerWidth;
        Canvas.height = window.innerHeight;
        Init();
    }
)

function Clamp(Value, MaxVal, MinVal) {
    return Math.min(Math.max(Value, MinVal), MaxVal);
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'w') {
        UpwardsP1 = true;
    }
    else if (event.key === 's') {
        DownwardsP1 = true;
    }
});
document.addEventListener('keyup', function (event) {
    if (event.key === 'w') {
        UpwardsP1 = false;
    }
    else if (event.key === 's') {
        DownwardsP1 = false;
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowUp') {
        UpwardsP2 = true;
    }
    else if (event.key === 'ArrowDown') {
        DownwardsP2 = true;
    }
});
document.addEventListener('keyup', function (event) {
    if (event.key === 'ArrowUp') {
        UpwardsP2 = false;
    }
    else if (event.key === 'ArrowDown') {
        DownwardsP2 = false;
    }
});

function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;

    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}




function CircleObj(PosX, PosY, SpeedX, SpeedY, Radius) {
    this.PosX = PosX;
    this.PosY = PosY;
    this.SpeedX = SpeedX;
    this.SpeedY = SpeedY;
    this.Radius = Radius;
    //this.Color = `rgb(${R},${G},${B})`;
    this.draw = function () {
        Context.beginPath();
        Context.arc(this.PosX, this.PosY, this.Radius, 0, Math.PI * 2, false);
        Context.fillStyle = "Black";
        Context.fill();
    }

    this.update = function () {
        this.PosX += this.SpeedX;
        this.PosY += this.SpeedY;

        if (this.PosY + this.Radius >= innerHeight || this.PosY - Radius <= 0) {
            this.SpeedY = -this.SpeedY;
        }

        this.draw();
    }
}







Player1PosY = innerHeight / 2;
Player1Width = 30;
Player1Height = 200;
Player1Speed = 400;
Player1PosX = innerWidth / 10;

function Player1Draw() {
    if (UpwardsP1) {
        Player1PosY -= Player1Speed * deltaTime;
    }
    else if (DownwardsP1) {
        Player1PosY += Player1Speed * deltaTime;
    }

    if (Player1PosY + Player1Height >= innerHeight) {
        Player1PosY = innerHeight - Player1Height
    }
    else if (Player1PosY <= 0) {
        Player1PosY = 0
    }

    Context.fillRect(Player1PosX, Player1PosY, Player1Width, Player1Height);
    Context.fillStyle = "Blue";
    Context.fill();
}

Player2PosX = innerWidth / 10 * 9 - Player1Width;
Player2PosY = innerHeight / 2;
Player2Width = 30;
Player2Height = 200;
Player2Speed = 400;
//this.Color = `rgb(${R},${G},${B})`;
function Player2Draw() {
    if (UpwardsP2) {
        Player2PosY -= Player2Speed * deltaTime;
    }
    else if (DownwardsP2) {
        Player2PosY += Player2Speed * deltaTime;
    }

    if (Player2PosY + Player2Height >= innerHeight) {
        Player2PosY = innerHeight - Player2Height
    }
    else if (Player2PosY <= 0) {
        Player2PosY = 0
    }

    Context.fillRect(Player2PosX, Player2PosY, Player2Width, Player2Height);
    Context.fillStyle = "Red";
    Context.fill();
}




var circleArray = [];
//var Player1Array = [];

function Init() {

    document.getElementById("Points1").textContent = Points1;
    document.getElementById("Points2").textContent = Points2;

    circleArray = [];
    for (var i = 0; i < 1; i++) {
        var Radius = 25;
        var PosX = Clamp((Math.random() * (innerWidth - Radius * 2)) + Radius, 2 * innerWidth / 3, innerWidth / 3);
        var SpeedX = 0
        while (Math.abs(SpeedX) < 7.5) {
            SpeedX = Math.random() * 30 - 15;
        }
        var PosY = (Math.random() * (innerHeight - Radius * 2)) + Radius;
        var SpeedY = 0;
        while (Math.abs(SpeedY) < 7.5) {
            SpeedY = Math.random() * 30 - 15;
        }

        /*var R = Math.random() * 255;
        var G = Math.random() * 255;
        var B = Math.random() * 255;*/
        circleArray.push(new CircleObj(PosX, PosY, SpeedX, SpeedY, Radius));
    }


}





function MoveObj(timestamp) {

    deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;


    Context.clearRect(0, 0, innerWidth, innerHeight)


    for (var i = 0; i < circleArray.length; i++) {


        let CloseY1 = circleArray[i].PosY;
        let CloseX1 = circleArray[i].PosX;
        let CloseY2 = circleArray[i].PosY;
        let CloseX2 = circleArray[i].PosX;

        //Player1 Hitbox
        if (circleArray[i].PosX > Player1PosX + Player1Width) {
            CloseX1 = Player1PosX + Player1Width;
        }
        else if (circleArray[i].PosX < Player1PosX) {
            CloseX1 = Player1PosX;
        }

        if (circleArray[i].PosY > Player1PosY + Player1Height) {
            CloseY1 = Player1PosY + Player1Height;
        }
        else if (circleArray[i].PosY < Player1PosY) {
            CloseY1 = Player1PosY;
        }

        //Player2 Hitbox
        if (circleArray[i].PosX > Player2PosX + Player2Width) {
            CloseX2 = Player2PosX + Player2Width;
        }
        else if (circleArray[i].PosX < Player2PosX) {
            CloseX2 = Player2PosX;
        }

        if (circleArray[i].PosY > Player2PosY + Player2Height) {
            CloseY2 = Player2PosY + Player2Height;
        }
        else if (circleArray[i].PosY < Player2PosY) {
            CloseY2 = Player2PosY;
        }

        let Distance1 = getDistance(circleArray[i].PosX, circleArray[i].PosY, CloseX1, CloseY1)
        let Distance2 = getDistance(circleArray[i].PosX, circleArray[i].PosY, CloseX2, CloseY2)


        if (Distance1 <= circleArray[i].Radius) {
            if (circleArray[i].PosX >= Player1PosX && circleArray[i].PosX <= Player1PosX + Player1Width) {
                circleArray[i].SpeedY = -circleArray[i].SpeedY
            }
            else {
                circleArray[i].SpeedX = -circleArray[i].SpeedX
            }
        }

        if (Distance2 <= circleArray[i].Radius) {
            if (circleArray[i].PosX >= Player2PosX && circleArray[i].PosX <= Player2PosX + Player2Width) {
                circleArray[i].SpeedY = -circleArray[i].SpeedY
            }
            else {
                circleArray[i].SpeedX = -circleArray[i].SpeedX
            }
        }


        if (circleArray[i].PosX + circleArray[i].Radius >= innerWidth) {
            Points1 += 1
            Init();
        }
        else if (circleArray[i].PosX - circleArray[i].Radius <= 0){
            Points2 += 1
            Init();
        }
        else {
            circleArray[i].update();
        }

    }
    /*for (var i = 0; i < Player1Array.length; i++) {
        Player1Array[i].update();
    }*/

    Player1Draw()
    Player2Draw()








    requestAnimationFrame(MoveObj);
}

Init();
MoveObj();