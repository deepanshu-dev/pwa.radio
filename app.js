const hlsPlayer = document.getElementById("hlsPlayer");
const audioPlayer = document.getElementById("audioPlayer");
const volume = document.getElementById("vol");
let hls;

function toggleMute() {
  if (volume.src.includes("unmute")) volume.src = "assets/svg/volume-mute.svg";
  else volume.src = "assets/svg/volume-unmute.svg";
  hlsPlayer.muted = !hlsPlayer.muted;
  audioPlayer.muted = !audioPlayer.muted;
}

function createCard(station) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<span>${station.name || "Unnamed Station"}</span>`;

  card.addEventListener("click", (e) => {
    if (!navigator.onLine) {
      alert("You are currently offline. Some features may not work.");
      return false;
    }
    volume.style.display = "block";
    const active = document.getElementsByClassName("card active");
    for (let index = 0; index < active.length; index++) {
      active[index].classList.remove("active");
    }
    card.classList.add("active");

    hlsPlayer.pause();

    audioPlayer.pause();
    audioPlayer.src = "";

    if (station.streamURL.endsWith(".m3u8")) loadHLS(station);
    else {
      audioPlayer.src = station.streamURL;
      audioPlayer.play();
    }
  });
  return card;
}

function loadHLS(station) {
  if (Hls.isSupported()) {
    if (hls) hls.destroy(); // Destroy the previous instance if it exists
    hls = new Hls();
    hls.loadSource(station.streamURL);
    hls.attachMedia(hlsPlayer);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      hlsPlayer.play();
    });
  } else if (hlsPlayer.canPlayType("application/vnd.apple.mpegurl")) {
    hlsPlayer.src = station.streamURL;
    hlsPlayer.addEventListener("loadedmetadata", function () {
      hlsPlayer.play();
    });
  }
}

async function getStations() {
  let stations = [];
  let response = await fetch("assets/radioStations.json");
  stations = await response.json();
  return stations;
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = document.getElementById("app");
  const radioStations = await getStations();
  if (radioStations.length > 0) {
    radioStations.forEach((station) => {
      const card = createCard(station);
      app.appendChild(card);
    });
    volume.addEventListener("click", toggleMute);
  }
});

// Add this check in your app.js or inline script of index.html
window.addEventListener("load", () => {
  window.addEventListener("offline", () => {
    // alert("You have lost internet connection.");
  });

  window.addEventListener("online", () => {
    // alert("You are back online.");
  });
});

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => console.log("Service Worker Registered"));
}
