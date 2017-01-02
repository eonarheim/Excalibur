var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game = new ex.Engine({ width: 800, height: 503, canvasElementId: "game" });
var padTexture = new ex.Texture("gamepad.png");
game.backgroundColor = ex.Color.White;
game.start(new ex.Loader([padTexture])).then(start);
function start() {
    var padSprite = new ex.Sprite(padTexture, 0, 0, padTexture.width, padTexture.height);
    game.input.gamepads.enabled = true;
    game.input.gamepads.setMinimumGamepadConfiguration({
        axis: 0,
        buttons: 8
    });
    game.input.gamepads.on("connect", function (evet) {
        console.log("Gamepad connect");
    });
    game.input.gamepads.on("disconnect", function (evet) {
        console.log("Gamepad disconnect");
    });
    var gamepad = new ex.Actor(0, 0, padSprite.width, padSprite.height);
    gamepad.anchor.setTo(0, 0);
    gamepad.addDrawing("bg", padSprite);
    game.add(gamepad);
    var buttonDefs = [
        [ex.Input.Buttons.Face1, 544, 221],
        [ex.Input.Buttons.Face2, 573, 193],
        [ex.Input.Buttons.Face3, 516, 193],
        [ex.Input.Buttons.Face4, 544, 166],
        [ex.Input.Buttons.LeftBumper, 250, 100],
        [ex.Input.Buttons.RightBumper, 547, 100],
        [ex.Input.Buttons.LeftTrigger, 270, 88],
        [ex.Input.Buttons.RightTrigger, 524, 88],
        [ex.Input.Buttons.Select, 365, 193],
        [ex.Input.Buttons.Start, 436, 193],
        [ex.Input.Buttons.LeftStick, 330, 272],
        [ex.Input.Buttons.RightStick, 470, 272],
        [ex.Input.Buttons.DpadUp, 255, 166],
        [ex.Input.Buttons.DpadDown, 255, 222],
        [ex.Input.Buttons.DpadLeft, 227, 193],
        [ex.Input.Buttons.DpadRight, 284, 193]
    ];
    var buttons = {};
    var buttonDef;
    for (var b = 0; b < buttonDefs.length; b++) {
        buttonDef = buttonDefs[b];
        buttons[b] = new CircleActor(buttonDef[1], buttonDef[2], 10, 10, new ex.Color(0, 0, 0, 0.7));
        game.add(buttons[b]);
    }
    var leftStick = new CircleActor(330, 272, 25, 25, ex.Color.fromRGB(95, 164, 22, 0.6));
    var rightStick = new CircleActor(470, 272, 25, 25, ex.Color.fromRGB(164, 45, 22, 0.6));
    game.add(leftStick);
    game.add(rightStick);
    game.on("postupdate", function (ue) {
        document.getElementById("gamepad-num").innerHTML = game.input.gamepads.getValidGamepads().length.toString();
        var pad1 = game.input.gamepads.getValidGamepads()[0];
        if (pad1) {
            var leftAxisX = pad1.getAxes(ex.Input.Axes.LeftStickX);
            var leftAxisY = pad1.getAxes(ex.Input.Axes.LeftStickY);
            var rightAxisX = pad1.getAxes(ex.Input.Axes.RightStickX);
            var rightAxisY = pad1.getAxes(ex.Input.Axes.RightStickY);
            leftStick.pos.x = 330 + (leftAxisX * 20);
            leftStick.pos.y = 272 + (leftAxisY * 20);
            rightStick.pos.x = 470 + (rightAxisX * 20);
            rightStick.pos.y = 272 + (rightAxisY * 20);
            var btnIndex;
            for (var btn in buttons) {
                if (!buttons.hasOwnProperty(btn))
                    continue;
                btnIndex = parseInt(btn, 10);
                if (pad1.isButtonPressed(btnIndex, 0.1)) {
                    buttons[btn].color = new ex.Color(255, 0, 0, 0.8);
                    buttons[btn].value = pad1.getButton(btnIndex);
                }
                else {
                    buttons[btn].color = new ex.Color(0, 0, 0, 0.7);
                    buttons[btn].value = 0;
                }
            }
        }
    });
}
var CircleActor = (function (_super) {
    __extends(CircleActor, _super);
    function CircleActor() {
        var _this = _super.apply(this, arguments) || this;
        _this.value = 0;
        return _this;
    }
    CircleActor.prototype.draw = function (ctx, delta) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.getWidth(), 0, 2 * Math.PI, true);
        ctx.fillStyle = this.color.toString();
        ctx.fill();
        ctx.closePath();
        if (this.value > 0) {
            ctx.fillText(this.value.toString(), 10, -10);
        }
        ctx.restore();
    };
    return CircleActor;
}(ex.Actor));
//# sourceMappingURL=gamepad.js.map