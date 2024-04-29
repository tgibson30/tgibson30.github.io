export class ScreenOverlay {
    constructor( canvas, displayWidth, displayHeight, params = {} ) {
        this.canvas = canvas;

        var scale = 2;
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        this.context = canvas.getContext('2d');
        this.context.translate(canvas.width/2, canvas.height/2);
    }

    drawCursor() {
        this.context.save();
        this.context.scale(0.5, 0.5);
        this.context.fillStyle="grey";
        this.context.fillRect(-25,-2,50,4);
        this.context.fillRect(-2,-25,4,50);
        this.context.restore();
    }

    drawItemBar( selectedItem ) {
        this.context.save();
        this.context.fillStyle= "rgba(25,25,25,0.5)";
        this.context.fillRect(-500, canvas.height/2-120, 1000, 120);

        this.context.strokeStyle = "rgb(100,100,100)";
        this.context.lineWidth = 10;
        for ( let i = 0; i < 8; i++ ) {
            this.context.rect(125 * i - 500, canvas.height/2-120, 125, 125);
            this.context.stroke();
        }
        this.context.restore();
    }

    drawPauseScreen() {
        this.context.save();
        this.context.fillStyle="rgba(50,50,50,0.6)";
        this.context.fillRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);

        this.context.scale(0.5, 0.5);
        this.context.fillStyle="white"

        let text = "Paused"
        this.context.font="6rem Arial"
        this.context.fillText(text, -150, -400);

        text = "Click to Play"
        this.context.font="4rem Arial"
        this.context.fillText(text, -160, -100);

        text = "Move: WASD"
        this.context.font="2rem Arial"
        this.context.fillText(text, -140, 0);

        text = "Jump: Spacebar"
        this.context.fillText(text, -140, 50);

        text = "Shoot Firework: E"
        this.context.fillText(text, -140, 100);

        text = "Place Block: Left Click"
        this.context.fillText(text, -140, 150);

        text = "Remove Block: Ctrl + Left Click"
        this.context.fillText(text, -140, 200);

        text = "Pause: Esc"
        this.context.fillText(text, -140, 250);

        this.context.restore();
    }

    drawEnderDragonStatus( health ) {
        this.context.save();
        this.context.scale(0.5, 0.5);

        this.context.fillStyle="grey"
        let text = "Ender Dragon"
        this.context.font="2rem Arial"
        //this.context.fillText(text, -110, -canvas.height/2 + 50 );
        this.context.fillText(text, -110, -canvas.height/2.2 );

        this.context.fillStyle="purple";
        let barwidth = canvas.width/2;
        //this.context.fillRect(-canvas.width/4, -canvas.height/2 + 80, barwidth * health/100 , 25);
        this.context.fillRect(-canvas.width/4,-canvas.height/2.3, barwidth * health/100 , 25);
        
        this.context.restore();
    }

    draw( params = {} ) {
        this.context.clearRect(-canvas.width/2, -canvas.height/2, canvas.width, canvas.height);

        //this.drawItemBar( params.selectedItem ? Number(params.selectedItem):1 );
        this.drawCursor();
        this.drawEnderDragonStatus( Number(params.dragonHealth) )

        if ( params.paused ) this.drawPauseScreen();
    }
}