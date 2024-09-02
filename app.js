let hlsPlayer = videojs('hlsPlayer');
const audioPlayer = document.getElementById('audioPlayer');

function createCard(station) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<span>${station.name || 'Unnamed Station'}</h3>`;

    card.addEventListener('click', (e) => {
        const active = document.getElementsByClassName("card active");
        for (let index = 0; index < active.length; index++)
        {        
            active[index].classList.remove("active");
        }
        card.classList.add("active");
    
        hlsPlayer.pause();
        hlsPlayer.src('');
        hlsPlayer.load();

        audioPlayer.pause();
        audioPlayer.src = '';
        audioPlayer.load();  
        if (station.hls) {
            hlsPlayer.src({
                src: station.url,
                type: 'application/x-mpegURL'
            });
            hlsPlayer.play();   
        }
        else {
            audioPlayer.src = station.url;
            audioPlayer.play();
        }
    });
    return card;
}

async function getJSON() {
    const response = await fetch("assets/radioStations.json");
    const json = await response.json();
    return json;
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = document.getElementById('app');

    const radioStations = await getJSON();
    radioStations.forEach(station => {
        const card = createCard(station);
        app.appendChild(card);
    });

    // Initialize the Video.js player
    videojs('audioPlayer');
});

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker Registered'));
}
