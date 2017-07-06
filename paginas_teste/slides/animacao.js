

function anim0_5() {
    this.iniciar = function () {
        this.tween = new TWEEN.Tween({ x: 10 })
            .to({ x: 95 }, 3000)
            .repeat(Infinity)
            .yoyo(true)
            .onUpdate(function () {
                document.getElementById("panel_max").style.setProperty("--size", this.x + "% 80%");
            })
            .start();
    };
};
var animacao0_5 = new anim0_5();