var max_score;
            setMaxScore();
            
            function endGame(point) { 
              if (point > MIN_POINT_CIUPON) {
                showModal("modal-codice")
              } else {
                showModal("modal-fallito")
              }

              if (point > max_score) {
                showGrandiosoModal(point)
              }
            }

            function setMaxScore(data) {
              //Se non viene passata la classifica la richiede
              if (data === undefined) {
                getScoreBorad().then((data) => {
                  max_score = data[data.length - 1].score;
                })
              } else { //Altrimenti usa quella che gli viene passata
                max_score = data[data.length - 1].score;
              }
            }

            function showGrandiosoModal(point) { 
              document.getElementById("final-score").innerHTML = point;
              showModal("modal-grandioso")
            }

            function hideGrandiosoModal(point) { 
              hideModal("modal-grandioso")
            }

            function showScoreboardModal() {
                getScoreBorad().then((data) => {
                  document.getElementById("scoreboard-list").innerHTML = generateHtmlList(data);
                  setMaxScore(data);
                })

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

            function toggleModal(modal_name) {
                var element = document.getElementsByClassName(modal_name);
                console.log(element);
                Array.from(element).forEach((el) => {
                    el.classList.toggle("active");
                });
            }

            function hideModal(modal_name) {
                var element = document.getElementsByClassName(modal_name);
                console.log(element);
                Array.from(element).forEach((el) => {
                    el.classList.remove("active");
                });
            }

            function showModal(modal_name) {
                var element = document.getElementsByClassName(modal_name);
                console.log(element);
                Array.from(element).forEach((el) => {
                    el.classList.add("active");
                });
            }

            function sanitizeHTML(text) {
                var element = document.createElement("div");
                element.innerText = text;
                return element.innerHTML;
            }