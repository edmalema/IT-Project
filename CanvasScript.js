var Canvas = document.querySelector("canvas");

Canvas.width = window.innerWidth;
Canvas.height = window.innerHeight;

var Context = Canvas.getContext("2d");

/*Context.fillRect(100, 100, 100, 8);

Context.fillRect(200, 400, 70, 150);


Context.beginPath();

Context.moveTo(50, 300);
Context.lineTo(300, 100);

Context.strokeStyle = "red";
Context.stroke();*/



/*
Context.fillStyle = "blue";

*/

var mouse = {

    x: undefined,
    y: undefined,
    Size: 200
}


window.addEventListener('mousemove',
    function (event) {
        mouse.x = event.x;
        mouse.y = event.y;
    }
)

window.addEventListener('resize',
    function () {
        Canvas.width = window.innerWidth;
        Canvas.height = window.innerHeight;
        Init();
    }
)


function CircleObj(PosX, PosY, SpeedX, SpeedY, Radius, R, G, B) {
    this.PosX = PosX;
    this.PosY = PosY;
    this.SpeedX = SpeedX;
    this.SpeedY = SpeedY;
    this.Radius = Radius;
    this.BaseRadius = Radius;
    this.MaxRadius = Radius * 5;
    this.Color = `rgb(${R},${G},${B})`;
    this.draw = function () {
        Context.beginPath();
        Context.arc(this.PosX, this.PosY, this.Radius, 0, Math.PI * 2, false);
        Context.fillStyle = this.Color;
        Context.fill();
    }

    this.update = function () {
        this.PosX += this.SpeedX;
        this.PosY += this.SpeedY;
        if (this.PosX + this.Radius >= innerWidth || this.PosX - this.Radius <= 0) {
            this.SpeedX = -this.SpeedX;
        }
        if (this.PosY + this.Radius >= innerHeight || this.PosY - this.Radius <= 0) {
            this.SpeedY = -this.SpeedY;
        }

        if (mouse.x - this.PosX < mouse.Size && mouse.x - this.PosX > -mouse.Size && mouse.y - this.PosY < mouse.Size && mouse.y - this.PosY > -mouse.Size) {
            this.Radius += 16;
            this.Radius = Clamp(this.Radius, this.MaxRadius, this.BaseRadius);
        }
        else {
            if (this.Radius > this.BaseRadius) {

                this.Radius /= 1.025;

                this.Radius = Clamp(this.Radius, this.MaxRadius, this.BaseRadius);
            }
        }

        this.draw();
    }
}






function Clamp(Value, MaxVal, MinVal) {
    return Math.min(Math.max(Value, MinVal), MaxVal);
}

var circleArray = [];

function Init() {
    circleArray = [];
    for (var i = 0; i < 600; i++) {
        var Radius = Math.random() * 60;
        var PosX = (Math.random() * (innerWidth - Radius * 2)) + Radius;
        var SpeedX = Math.random() * 10 - 5;
        var PosY = (Math.random() * (innerHeight - Radius * 2)) + Radius;
        var SpeedY = Math.random() * 10 - 5;

        var R = Math.random() * 255;
        var G = Math.random() * 255;
        var B = Math.random() * 255;
        circleArray.push(new CircleObj(PosX, PosY, SpeedX, SpeedY, Radius, R, G, B));
    }
}


function MoveCircle() {
    requestAnimationFrame(MoveCircle);
    Context.clearRect(0, 0, innerWidth, innerHeight)



    for (var i = 0; i < circleArray.length; i++) {
        circleArray[i].update();
    }



}

Init();
MoveCircle();
