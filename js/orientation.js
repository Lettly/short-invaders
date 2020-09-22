document.getElementById("shareButton").addEventListener("click", (event) => {
    if (navigator.share) {
        navigator
            .share({
                title: "Short Invaders GAME",
                url: "https://shortinvaders.com",
            })
            .then(() => {
                console.log("Thanks for sharing!");
            })
            .catch(console.error);
    } else {
        showModal("modal-shere");
    }
});

document
    .getElementsByClassName("game-controls")[0]
    .addEventListener("click", (event) => {
        startGame();
    });

window.addEventListener("orientationchange", function () {
    if (window.orientation == 90 || window.orientation == -90) {
        // landscape mode
        showModal("modal-landscape");
    } else {
        // portrait mode
        hideModal("modal-landscape");
    }
});
if (window.orientation == 90 || window.orientation == -90) {
    // landscape mode
    showModal("modal-landscape");
} else {
    // portrait mode
    hideModal("modal-landscape");
}
