
var elementoAntigo;
var animacaoCorrente;
var contadorPrincipal = -1;
var contadorSecundario = -1;

var timerLeft;
var timerRight;
function clicado(pos) {
    if (pos && pos.keyCode) {
        if (pos.keyCode == 37) {
            clickRight();
        }
        else if (pos.keyCode == 38) {
            clickLeftDbl();
        }
        else if (pos.keyCode == 39) {
            clickLeft();
        }
        else if (pos.keyCode == 40) {
            clickRightDbl();
        }

        return;
    }

    if (pos == 'left') {
        if (timerLeft) {
            clearTimeout(timerLeft);

            clickLeftDbl();
        }
        else {
            timerLeft = setTimeout(clickLeft, 250);
        }
    }
    else {
        if (timerRight) {
            clearTimeout(timerRight);

            clickRightDbl();
        }
        else {
            timerRight = setTimeout(clickRight, 250);
        }
    }
};

function clickLeft() {
    timerLeft = undefined;

    contadorSecundario++;

    while (contadorSecundario < 100) {
        if (show(contadorPrincipal, contadorSecundario)) {
            return;
        }

        contadorSecundario++;
    }

    clickLeftDbl();
};

function clickLeftDbl() {
    timerLeft = undefined;

    contadorPrincipal++;
    contadorSecundario = 0;

    while (contadorPrincipal <= 100) {
        if (show(contadorPrincipal, contadorSecundario)) {
            return;
        }

        contadorPrincipal++;
    }
};

function clickRight() {
    timerRight = undefined;

    if (contadorSecundario == 0 && contadorPrincipal > 0) {
        contadorSecundario = 101;
        contadorPrincipal--;
    }

    contadorSecundario--;

    while (contadorPrincipal >= 0) {
        while (contadorSecundario >= 0) {
            if (show(contadorPrincipal, contadorSecundario)) {
                return;
            }

            contadorSecundario--;
        }

        contadorPrincipal--;
        contadorSecundario = 100;
    }

    clickRightDbl();
};

function clickRightDbl() {
    timerRight = undefined;

    if (contadorPrincipal > 0) {
        contadorPrincipal--;
    }
    else if (contadorSecundario == 0) {
        return;
    }

    contadorSecundario = 0;

    while (contadorPrincipal >= 0) {
        if (show(contadorPrincipal, contadorSecundario)) {
            return;
        }

        contadorPrincipal--;
    }
};

function show(principal, secundario) {
    var elemento = document.getElementById('slide' + principal.toString() + '_' + secundario.toString());

    if (elemento) {
        if (elementoAntigo) {
            elementoAntigo.style.visibility = 'hidden';
        }

        elemento.style.visibility = 'visible';
        elementoAntigo = elemento;

        if (animacaoCorrente) {
            animacaoCorrente.terminar();
            animacaoCorrente = undefined;
        }

        if (window['animacao' + principal.toString() + '_' + secundario.toString()]) {

            animacaoCorrente = window['animacao' + principal.toString() + '_' + secundario.toString()];

            animacaoCorrente.iniciar();
        }
        return true;
    }

    return false;
};

clickLeft();

function verificarAnimacao() {
    TWEEN.update();

    requestAnimationFrame(verificarAnimacao);
};

verificarAnimacao();