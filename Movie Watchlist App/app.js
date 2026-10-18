const poster = (id, width = 720) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

const movies = [
  { id: "past-lives", title: "Past Lives", year: 2023, director: "Celine Song", genre: "Drama", category: "drama", rating: "7.9", image: "photo-1470252649378-9c29740c9fa8", description: "Two deeply connected childhood friends are wrested apart after one family emigrates from South Korea." },
  { id: "arrival", title: "Arrival", year: 2016, director: "Denis Villeneuve", genre: "Sci-fi", category: "sci-fi", rating: "7.9", image: "photo-1446776811953-b23d57bd21aa", description: "A linguist races to communicate with visitors from another world." },
  { id: "grand-budapest", title: "The Grand Budapest Hotel", year: 2014, director: "Wes Anderson", genre: "Comedy", category: "comedy", rating: "8.1", image: "photo-1511818966892-d7d671e672a2", description: "A legendary concierge and his young protégé get caught up in a very unusual caper." },
  { id: "whiplash", title: "Whiplash", year: 2014, director: "Damien Chazelle", genre: "Drama", category: "drama", rating: "8.5", image: "photo-1516280440614-37939bbacd81", description: "A young drummer pursues perfection under a conductor who demands everything." },
  { id: "her", title: "Her", year: 2013, director: "Spike Jonze", genre: "Romance", category: "drama", rating: "8.0", image: "photo-1519608487953-e999c86e7455", description: "In the near future, a lonely writer finds an unexpected connection." },
  { id: "into-wild", title: "Into the Wild", year: 2007, director: "Sean Penn", genre: "Adventure", category: "adventure", rating: "8.1", image: "photo-1472396961693-142e6e269027", description: "A young adventurer leaves everything behind for the American wilderness." },
  { id: "knives-out", title: "Knives Out", year: 2019, director: "Rian Johnson", genre: "Thriller", category: "thriller", rating: "7.9", image: "photo-1518709268805-4e9042af9f23", description: "A sharp-eyed detective unpicks the secrets of a very dysfunctional family." },
  { id: "moonrise", title: "Moonrise Kingdom", year: 2012, director: "Wes Anderson", genre: "Adventure", category: "adventure", rating: "7.8", image: "photo-1500530855697-b586d89ba3ee", description: "Two young outsiders run away together, and their whole island comes looking." },
  { id: "eternal-sunshine", title: "Eternal Sunshine", year: 2004, director: "Michel Gondry", genre: "Romance", category: "drama", rating: "8.3", image: "photo-1470770841072-f978cf4d019e", description: "A couple find out what it means to lose their memories of each other." },
  { id: "hunt-wilderpeople", title: "Hunt for the Wilderpeople", year: 2016, director: "Taika Waititi", genre: "Comedy", category: "comedy", rating: "7.8", image: "photo-1464822759023-fed622ff2c3b", description: "An unlikely duo go on the run through the New Zealand bush." },
  { id: "nightcrawler", title: "Nightcrawler", year: 2014, director: "Dan Gilroy", genre: "Thriller", category: "thriller", rating: "7.8", image: "photo-1519608487953-e999c86e7455", description: "A driven freelance cameraman discovers the darker side of local news." },
  { id: "interstellar", title: "Interstellar", year: 2014, director: "Christopher Nolan", genre: "Sci-fi", category: "sci-fi", rating: "8.7", image: "photo-1462331940025-496dfbfc7564", description: "A crew ventures beyond this galaxy to find a future for humanity." }
];

const STORAGE_KEY = "reelgood-watchlist-v1";
const defaultWatchlist = ["past-lives", "arrival", "grand-budapest", "whiplash", "her", "into-wild", "knives-out", "moonrise"];
let saved;
try {
  saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
} catch (error) {
  console.error("Could not read the saved watchlist:", error);
}
let watchlist = Array.isArray(saved)
  ? saved.filter((entry) => typeof entry.id === "string" && typeof entry.watched === "boolean" && movies.some((movie) => movie.id === entry.id))
  : defaultWatchlist.map((id) => ({ id, watched: false }));
let activeView = "watchlist";
let activeFilter = "all";
let searchQuery = "";
let toastTimer;

const grid = document.querySelector("#movie-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search");
const filterButtons = [...document.querySelectorAll(".filter-chip")];
const installButton = document.querySelector("#install-button");
const installDialog = document.querySelector("#install-dialog");
let installPrompt;

function saveWatchlist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error("Could not save the watchlist:", error);
    showToast("Couldn’t save your changes in this browser.");
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function movieFor(id) {
  return movies.find((movie) => movie.id === id);
}

function getVisibleMovies() {
  let list = activeView === "discover"
    ? movies.map((movie) => ({ ...movie, watched: false }))
    : watchlist.map((entry) => ({ ...movieFor(entry.id), watched: entry.watched }));

  if (activeView === "watchlist") list = list.filter((movie) => !movie.watched);
  if (activeView === "watched") list = list.filter((movie) => movie.watched);
  if (activeFilter !== "all") list = list.filter((movie) => movie.category === activeFilter);
  if (searchQuery) {
    const query = searchQuery.toLocaleLowerCase();
    list = list.filter((movie) => `${movie.title} ${movie.director} ${movie.genre} ${movie.year}`.toLocaleLowerCase().includes(query));
  }

  const sort = document.querySelector("#sort-select").value;
  if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "year") list.sort((a, b) => b.year - a.year);
  if (sort === "rating") list.sort((a, b) => Number(b.rating) - Number(a.rating));
  if (sort === "added") {
    const order = activeView === "discover" ? movies.map((movie) => movie.id) : watchlist.map((entry) => entry.id);
    list.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }
  return list;
}

function renderCard(movie) {
  const inList = watchlist.some((entry) => entry.id === movie.id);
  const label = movie.watched ? "Mark as unwatched" : "Mark as watched";
  return `
    <article class="movie-card">
      <div class="poster-wrap">
        <img class="poster" src="${poster(movie.image)}" alt="${movie.title} film still" loading="lazy" />
        <div class="poster-overlay"></div>
        <div class="rating"><span class="rating-star">★</span> ${movie.rating}</div>
        <span class="genre-tag">${movie.genre}</span>
        ${movie.watched ? '<span class="watched-badge">✓ WATCHED</span>' : ""}
        <div class="card-actions">
          ${inList ? `<button class="icon-button" data-action="watched" data-id="${movie.id}" aria-label="${label}" title="${label}">${movie.watched ? "↶" : "✓"}</button><button class="icon-button" data-action="remove" data-id="${movie.id}" aria-label="Remove ${movie.title}" title="Remove from list">−</button>` : `<button class="icon-button" data-action="add" data-id="${movie.id}" aria-label="Add ${movie.title}" title="Add to watchlist">＋</button>`}
        </div>
      </div>
      <div class="card-info">
        <div class="movie-title-row"><h3 class="movie-title" title="${movie.title}">${movie.title}</h3><span class="movie-year">${movie.year}</span></div>
        <p class="movie-director">${movie.director}</p>
      </div>
    </article>`;
}

function render() {
  const list = getVisibleMovies();
  grid.innerHTML = list.map(renderCard).join("");
  grid.hidden = list.length === 0;
  emptyState.hidden = list.length !== 0;
  const watchCount = watchlist.filter((entry) => !entry.watched).length;
  const watchedCount = watchlist.filter((entry) => entry.watched).length;
  document.querySelector("#sidebar-count").textContent = watchCount;
  document.querySelector("#all-count").textContent = activeView === "watched" ? watchedCount : activeView === "discover" ? movies.length : watchCount;
  document.querySelector("#collection-count").textContent = `${list.length} ${list.length === 1 ? "FILM" : "FILMS"}`;

  const labels = {
    watchlist: ["MY WATCHLIST", "Your watchlist", "All the films you’ve been meaning to see, in one very good place.", "The watchlist", "A few stories waiting for their moment."],
    watched: ["WATCHED", "Already seen", "The stories you’ve already spent a little time with.", "Your watched films", "Every good story is worth remembering."],
    discover: ["DISCOVER", "Find your next film", "Good stories, great directors, and something for every kind of movie night.", "The collection", "A hand-picked collection of films worth your time."]
  }[activeView];
  document.querySelector("#page-crumb").textContent = labels[0];
  document.querySelector("#page-title").innerHTML = `${labels[1]}<span class="title-period">.</span>`;
  document.querySelector("#page-intro").textContent = labels[2];
  document.querySelector("#collection-title").textContent = labels[3];
  document.querySelector("#collection-subtitle").textContent = labels[4];

  const empty = activeView === "watchlist" ? ["Your list is a blank canvas.", "Every great movie night starts with one good film.", "Find something to watch"]
    : activeView === "watched" ? ["Nothing watched just yet.", "Once you’ve seen a film, save it here.", "Explore the collection"]
      : ["No films found.", "Try another search or filter to find your next watch.", "Clear filters"];
  document.querySelector("#empty-title").textContent = empty[0];
  document.querySelector("#empty-copy").textContent = empty[1];
  document.querySelector("#empty-action").innerHTML = `${empty[2]} <span aria-hidden="true">↗</span>`;

  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === activeView));
}

function addMovie(id) {
  if (watchlist.some((entry) => entry.id === id)) return;
  watchlist.unshift({ id, watched: false });
  saveWatchlist();
  render();
  showToast(`${movieFor(id).title} added to your watchlist.`);
}

function handleAction(action, id) {
  if (action === "add") return addMovie(id);
  if (action === "remove") {
    watchlist = watchlist.filter((entry) => entry.id !== id);
    saveWatchlist();
    render();
    showToast(`${movieFor(id).title} removed from your list.`);
  }
  if (action === "watched") {
    const entry = watchlist.find((item) => item.id === id);
    if (!entry) return;
    entry.watched = !entry.watched;
    saveWatchlist();
    render();
    showToast(entry.watched ? `${movieFor(id).title} marked as watched.` : `${movieFor(id).title} moved back to your watchlist.`);
  }
}

document.querySelector("#current-date").textContent = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date());
const featured = movieFor("arrival");
document.querySelector("#featured-image").src = poster(featured.image, 1500);
document.querySelector("#featured-title").textContent = featured.title;
document.querySelector("#featured-meta").innerHTML = `${featured.year}<span>•</span>${featured.director}<span>•</span>★ ${featured.rating}`;
document.querySelector("#featured-description").textContent = featured.description;
document.querySelector("#featured-button").addEventListener("click", () => addMovie(featured.id));

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => {
    activeView = button.dataset.view;
    activeFilter = "all";
    searchQuery = "";
    searchInput.value = "";
    filterButtons.forEach((chip) => chip.classList.toggle("selected", chip.dataset.filter === "all"));
    render();
  });
});
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((chip) => chip.classList.toggle("selected", chip === button));
    render();
  });
});
searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim();
  render();
});
document.querySelector("#sort-select").addEventListener("change", render);
grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (button) handleAction(button.dataset.action, button.dataset.id);
});
document.querySelector("#empty-action").addEventListener("click", () => {
  if (activeView !== "discover") {
    activeView = "discover";
    activeFilter = "all";
    searchQuery = "";
    searchInput.value = "";
  } else if (activeFilter !== "all" || searchQuery) {
    activeFilter = "all";
    searchQuery = "";
    searchInput.value = "";
  }
  filterButtons.forEach((chip) => chip.classList.toggle("selected", chip.dataset.filter === "all"));
  render();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === "Escape") searchInput.blur();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;
});
window.addEventListener("appinstalled", () => {
  installPrompt = null;
  installButton.querySelector("span:last-child").textContent = "App installed";
  installButton.disabled = true;
  showToast("Reelgood is ready on your home screen.");
});
installButton.addEventListener("click", async () => {
  if (installPrompt) {
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    installPrompt = null;
    if (choice.outcome === "accepted") showToast("Reelgood is being installed.");
    return;
  }

  const userAgent = navigator.userAgent;
  const isAppleMobile = /iPhone|iPad|iPod/i.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instructions = isAppleMobile
    ? "On your iPhone or iPad, tap Share in Safari, then choose “Add to Home Screen.”"
    : /Android/i.test(userAgent)
      ? "Open your browser menu and choose “Install app” or “Add to Home screen.”"
      : "Open this page in a browser that supports app installation, then use its install icon or browser menu.";
  document.querySelector("#install-instructions").textContent = instructions;
  installDialog.showModal();
});
document.querySelector("#dialog-done").addEventListener("click", () => installDialog.close());

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.error("Could not register the offline app:", error);
    showToast("Offline support could not be enabled.");
  });
}

render();
