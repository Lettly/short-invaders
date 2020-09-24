const Bowser = window.bowser;
const currentBrowser = Bowser.parse(window.navigator.userAgent).browser.name;
switch(currentBrowser){
    case 'Chrome':
        break;
    case 'Microsoft Edge':
        break;
    case 'Safari':
        break;
    default:
        alert('Il gioco potrebbe non funzionare correttamente su questo Browser.');
        break;
}