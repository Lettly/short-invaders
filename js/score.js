var max_score;
setMaxScore();

function endGame(point) {
    if (point > 100 && point <= 150){
        showCodiceModal("5 EURO", "HEXJC", point);
    } else if (point > 150 && point <= 200){
        showCodiceModal("10 EURO", "PHGYS", point);
    } else if (point > 200 && point <= 400){
        showCodiceModal("15 EURO", "NAHVZ", point);
    } else if (point > 400){
        showCodiceModal("20 EURO", "WKBKN", point);
    } else {
        showFallitoModal(point);
    }

    if (point > max_score) {
        showGrandiosoModal(point);
    }
}

function setMaxScore(data) {
    //Se non viene passata la classifica la richiede
    if (data === undefined) {
        getScoreBorad().then((data) => {
            if (data.length < 10) {
                max_score = 0;
            } else {
                max_score = data[data.length - 1].score;
            }
        });
    } else {
        //Altrimenti usa quella che gli viene passata
        if (length < 10) {
            max_score = 0;
        } else {
            max_score = data[data.length - 1].score;
        }
    }
}

function showGrandiosoModal(point) {
    document.getElementById("final-score").innerHTML = point;
    showModal("modal-grandioso");
}

function showFallitoModal(point) {
    document.getElementById("final-score-fallito").innerHTML = point;
    showModal("modal-fallito");
}

function hideFallitModal(point) {
    hideModal("modal-fallito");
}

function hideGrandiosoModal(point) {
    hideModal("modal-grandioso");
}

function showScoreboardModal() {
    getScoreBorad().then((data) => {
        document.getElementById("scoreboard-list").innerHTML = generateHtmlList(
            data
        );
        setMaxScore(data);
    });

    function generateHtmlList(scoreboard) {
        output = ``;
        scoreboard.forEach((el) => {
            output += `<ul class="flex-score-list"><li>${sanitizeHTML(
                el.name
            )}</li><li>${sanitizeHTML(el.score)}</li></ul>`;
        });
        return output;
    }

    showModal("modal-scoreboard");
}

function hideScoreboardModal() {
    hideModal("modal-scoreboard");
}

function showCodiceModal(percentuale, codice, point) {
    document.getElementById("final-score-codice").innerHTML = point;
    document.getElementById("codice-sconto").innerHTML = codice;
    document.getElementById("percentuale-sconto").innerHTML = percentuale;
    showModal("modal-codice");
}

function hideCodiceModal() {
    hideModal("modal-codice");
}

function toggleModal(modal_name) {
    var element = document.getElementsByClassName(modal_name);
    Array.from(element).forEach((el) => {
        el.classList.toggle("active");
    });
}

function hideModal(modal_name) {
    var element = document.getElementsByClassName(modal_name);
    Array.from(element).forEach((el) => {
        el.classList.remove("active");
    });
}

function showModal(modal_name) {
    var element = document.getElementsByClassName(modal_name);
    Array.from(element).forEach((el) => {
        el.classList.add("active");
    });
}

function sanitizeHTML(text) {
    var element = document.createElement("div");
    element.innerText = text;
    return element.innerHTML;
}
