const Bowser = window.bowser;
console.log(Bowser.parse(window.navigator.userAgent).browser.name);
const currentBrowser = Bowser.parse(window.navigator.userAgent).browser.name;
switch(currentBrowser){
    case 'Chrome':
        break;
    case 'Microsoft Edge':
        break;
    default:
        alert('Il gioco potrebbe non funzionare correttamente su questo Browser.');
        break;
}