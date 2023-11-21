// DOM elements
const searchInput = document.getElementById("searchInput");
const errorMessage = document.getElementById("errorMessage");
const moviesWrapper = document.getElementById("movies_wrapper");
const loadingIndicator = document.getElementById("loading");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pagination = document.getElementById("pagination");
const detailsModal = document.getElementById("detailsModal");
const modalData = document.getElementById("modalData");

const API_KEY = "b9518d7a";
// State variables
let inputText = "";
let page = 1;
let timeoutId;

// Event listeners
searchInput.addEventListener("input", handleSearchInput);
prevBtn.addEventListener("click", handlePrevButtonClick);
nextBtn.addEventListener("click", handleNextButtonClick);
moviesWrapper.addEventListener("click", handleMovieCardClick);

// Fetch movies function
const fetchMovies = async () => {
  inputText = searchInput.value;

  try {
    const url = `https://www.omdbapi.com/?&apikey=${API_KEY}&s=${inputText}&page=${page}`;
    showLoadingIndicator();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const results = data.Search;

    updatePaginationVisibility(data.totalResults);

    updatePrevButtonState();

    handleMoviesResults(results);
  } catch (err) {
    handleError(err);
  } finally {
    hideLoadingIndicator();
  }
};

// Input handler
function handleSearchInput(e) {
  e.preventDefault();

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    fetchMovies();
  }, 1000);

  if (!e.target.value) {
    clearTimeout(timeoutId);
    hideErrorMessage();
  }
}

// Previous button click handler
function handlePrevButtonClick(e) {
  e.preventDefault();
  page--;
  clearMoviesWrapper();
  fetchMovies();
}

// Next button click handler
function handleNextButtonClick(e) {
  e.preventDefault();
  page++;
  clearMoviesWrapper();
  fetchMovies();
}

// Movie card click handler
function handleMovieCardClick(event) {
  const clickedCard = event.target.closest(".movieCard");
  if (clickedCard) {
    const id = clickedCard.id;
    fetchMovieDetails(id);
  }
}

// Fetch movie details function
async function fetchMovieDetails(id) {
  try {
    const url = `https://www.omdbapi.com/?&apikey=${API_KEY}&i=${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    showDetails(data);
  } catch (error) {
    console.error(error);
  }
}

// Show movie details function
const showDetails = (data) => {
  const {
    Poster,
    Title,
    Year,
    Released,
    Runtime,
    Genre,
    Director,
    Plot,
    Language,
    Country,
    imdbRating,
  } = data;

  modalData.innerHTML = `
    <div class="md:flex px-4 leading-none max-w-4xl">
        <div class="flex-none ">
            <img src=${Poster}
                alt=${Title}
                class="h-72 w-56 rounded-md shadow-2xl transform -translate-y-4 border-4 border-gray-300 " />
        </div>

        <div class="flex-col text-gray-300 px-4">

            <p class="pt-4 text-2xl font-bold"><span id="title">${Title}</span> | <span id="year">${Year}</span></p>
            <hr class="hr-text" data-content="">
            <div class="text-md flex justify-between my-2">
                <span class="font-bold"><span id="runtime">${Runtime}</span> | <span id="genre">${Genre}</span></span>
                <span class="font-bold"></span>
            </div>
            <p id="plot" class="hidden md:block my-4 text-sm text-left">${Plot}</p>
            <p  class="flex text-md my-2">
                Released on ${Released}
            </p>
            <p id="rating" class="flex text-md my-2">
                Rating: ${imdbRating}
            </p>
            <p  class="flex text-md my-2">
                Language: ${Language}
            </p>
            <p  class="flex text-md my-2">
                Country: ${Country}
            </p>
            <p  class="flex text-md my-2">
                Director: ${Director}
            </p>

            
        </div>
    </div>`;
  detailsModal.showModal();
};
// Loading indicator functions
const showLoadingIndicator = () => {
  loadingIndicator.classList.remove("hidden");
};

const hideLoadingIndicator = () => {
  loadingIndicator.classList.add("hidden");
};

// Pagination and button state functions
const updatePaginationVisibility = (totalResults) => {
  pagination.classList.toggle("hidden", totalResults <= 10);
};

const updatePrevButtonState = () => {
  page === 1
    ? prevBtn.setAttribute("disabled", "")
    : prevBtn.removeAttribute("disabled");
};

// Error handling functions
const handleError = (err) => {
  console.error(err);
  errorMessage.textContent = "Something went wrong. Please try again later!";
  errorMessage.classList.remove("hidden");
};

const hideErrorMessage = () => {
  errorMessage.classList.add("hidden");
};

// Clear movies wrapper function
const clearMoviesWrapper = () => {
  moviesWrapper.innerHTML = "";
};

// Handle movies results function
const handleMoviesResults = (results) => {
  if (results === undefined) {
    errorMessage.textContent = "No Movies Found!";
    errorMessage.classList.remove("hidden");
    clearMoviesWrapper();
  } else {
    hideErrorMessage();
    displayMovies(results);
  }
};
// Display movies function
const displayMovies = (data) => {
  const fragment = new DocumentFragment();
  data.forEach((item) => {
    const movieCard = createMovieCard(item);
    fragment.appendChild(movieCard);
  });

  clearMoviesWrapper();
  moviesWrapper.appendChild(fragment);
};
// Create movie card function
const createMovieCard = (item) => {
  const movieCard = document.createElement("div");
  movieCard.classList.add("movieCard", "w-52", "h-full");
  movieCard.setAttribute("id", item.imdbID);
  movieCard.innerHTML = `
    <div class="card bg-base-100 h-full shadow-xl cursor-pointer hover:scale-95 transition duration-500 flex flex-col justify-between">
        <figure class="h-[70%]"><img class="min-h-full" src=${item.Poster} alt="movie" /></figure>
        <div class="card-body mt-4">
            <h2 class="card-title w-fit mx-auto text-base text-center font-semibold">${item.Title}</h2>
            <h2 class="text-xs mt-2 text-center">Released on <span class="font-bold">${item.Year}</span></h2>
        </div>
    </div>`;
  return movieCard;
};

// Initial fetch
// fetchMovies();
