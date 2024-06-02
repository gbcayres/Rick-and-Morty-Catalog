import { elements } from "./elements.mjs";
import { fetchCharacters, getPageInfo } from "./api.mjs";
import { capitalizeFirstLetters } from "./utils.mjs";

export function initialize() {
  setupCards();
  setupInput();
  setupSelects();
  setupButtons();
}

async function setupCards() {
  updateScreen();
}

function setupInput() {
  elements.nameInput.addEventListener("input", async () => {
    resetPage();
    await updateScreen();
  });
}

function setupSelects() {
  elements.selectContainers.forEach(setupSelect);
}

async function fetchAndDisplayCharacters(url) {
  try {
    const characters = await fetchCharacters(url);
    if (characters) {
      displayCards(characters);
    }
  } catch (error) {
    displayError(error);
  }
}

function displayCards(characters) {
  const cards = characters
    .map((character) => {
      return createCard(character);
    })
    .join("");

  elements.cardsContainer.innerHTML = cards;
}

function createCard(character) {
  return `
    <div class="card">  
      <img class="card__image" src="${character.image}" alt="${character.name}">
      <div class="card__content">
        <h4 class="character-name">${character.name}</h4>
        <div class="character-info">
          <div class="character-info__status">
            <i class="fa-solid fa-circle ${getCharacterStatusColor(
              character.status,
            )}"></i>
            <p>${character.status}</p>
          </div>
          <p class="character-info__specie">${character.species}</p>
          <p class="character-info__genre">${character.gender}</p>
        </div>
      </div>
      <a class="see-details" href="#">see character details</a>
    </div>
  `;
}

function getCharacterStatusColor(status) {
  switch (status) {
    case "Alive":
      return "green";
    case "Dead":
      return "red";
    case "unknown":
      return "yellow";
    default:
      return "";
  }
}

function displayError(error) {
  elements.cardsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
}

function getSearchUrl() {
  const page = elements.page.textContent;
  const [name, specie, gender, status] = getSearchValues();
  return `https://rickandmortyapi.com/api/character/?page=${page}&name=${name}&species=${specie}&status=${status}&gender=${gender}`;
}

function getSearchValues() {
  const searchValues = [
    capitalizeFirstLetters(elements.nameInput.value),
    ...getSelectedFilters(),
  ];
  return searchValues;
}

function getSelectedFilters() {
  const filters = [];
  const selectedValuesArray = [...elements.selectedValues];
  selectedValuesArray.forEach((selectedValue) => {
    filters.push(selectedValue.textContent);
  });

  return validateFilters(filters);
}

function validateFilters(filters) {
  const validFilters = filters.map((filter) => {
    if (
      filter === "Specie" ||
      filter === "Gender" ||
      filter === "Status" ||
      filter === "Any"
    ) {
      return "";
    }
    return filter;
  });

  return validFilters;
}

function setupSelect(selectContainer) {
  const selectedValue = selectContainer.querySelector(".selected-value");
  const viewOptionsBtn = selectContainer.querySelector("input[type=checkbox]");
  const options = selectContainer.querySelector(".options");

  options.addEventListener("click", async (event) => {
    const option = event.target.closest(".option");

    if (option) {
      updateSelectedValue(option, selectedValue);
      closeOptionsWhenSelected(viewOptionsBtn, event);
      resetPage();
      await updateScreen();
    }
  });
}

function updateSelectedValue(option, selectedValue) {
  const optionValue = option.querySelector("input").dataset.label;
  selectedValue.textContent = optionValue;
}

function closeOptionsWhenSelected(viewOptionsBtn, event) {
  const isMouseOrTouch =
    event.pointerType === "mouse" || event.pointerType === "touch";

  if (isMouseOrTouch) viewOptionsBtn.click();
}

function setupButtons() {
  elements.nextPageBtn.addEventListener("click", async () => {
    incrementPage();
    await updateScreen();
  });

  elements.backPageBtn.addEventListener("click", async () => {
    decrementPage();
    await updateScreen();
  });
}

async function incrementPage() {
  elements.page.textContent = parseInt(elements.page.textContent) + 1;
}

async function decrementPage() {
  elements.page.textContent = parseInt(elements.page.textContent) - 1;
}

function resetPage() {
  elements.page.textContent = 1;
}

async function checkButtons() {
  const url = getSearchUrl();
  const page = await getPageInfo(url);
  if (!page.prev) {
    elements.backPageBtn.classList.add("hidden");
  } else {
    elements.backPageBtn.classList.remove("hidden");
  }

  if (!page.next) {
    elements.nextPageBtn.classList.add("hidden");
  } else {
    elements.nextPageBtn.classList.remove("hidden");
  }
}

async function updateScreen() {
  const url = getSearchUrl();
  await fetchAndDisplayCharacters(url);
  await checkButtons();
}
