const cardsContainer = document.getElementById('cardsContainer')
const buttonNext = document.getElementById('nextButton')
const buttonPrev = document.getElementById('prevButton')
const currentPageView = document.getElementById('current-page')
const totalPages = document.getElementById('total-pages')
const formSearch = document.getElementById('searchCharacters')
const modal = document.getElementById('infoCharacters')

const totalEpisodes = document.getElementById('numAllEpisodes')
const totalCharacters = document.getElementById('numAllCharacter')
const totalLocations = document.getElementById('numAllLocations')

const characterPerPage = 6

let currentPage = 1
let pageView = 1;
let characters = [];
let charactersView = [];
let totalOfCharacters
let characterName = ''


formSearch.addEventListener('submit', (e) => {
  e.preventDefault();

  setCurrentPageView(1);

  characters = [];
  charactersView = [];

  characterName = formSearch[0].value
  currentPage = 1

  fetchCharacters();
  fetchFooterInfo();
  setView();
})


function resetCharacters(){
  cardsContainer.innerHTML = '';
}

function setCurrentPageView(newPage) {
  pageView = newPage;
  
  currentPageView.innerHTML = newPage;
}

async function fetchCharacters() {
    try {
        const { data } = await api.get("/character?page=" + currentPage + "&name=" + characterName);
    
        characters.push(...data.results);
    
      } catch (error) {
        console.log(error);
      }
}

async function setView() {
  charactersView = characters.slice(
    (pageView - 1) * characterPerPage,
    pageView * characterPerPage
  );

  if (charactersView.length < characterPerPage) {
    currentPage++;
    await fetchCharacters();

    charactersView = characters.slice(
      (pageView - 1) * characterPerPage,
      pageView * characterPerPage
      );
  }

  resetCharacters();
  disableButtons();

  for(let character = 0; character < charactersView.length; character++) {

    if(character < 4){
      addCard(charactersView[character], false);
    } else {
      addCard(charactersView[character], true);
    }
  }
}

function addCard(character, isFullWidth = false) {
  const card = document.createElement('div')
  card.classList.add(isFullWidth ? 'col-sm-12' : 'col-sm-6', 'mb-5')

  card.innerHTML += `
    <div class="card" data-bs-toggle="modal" data-id="${character.id}" data-bs-target="#infoCharacters" style="max-width: 540px;">
      <div class="row g-0">
          <div class="col-md-4">
          <img src="${character.image}" class="img-fluid rounded-start" alt="image of ${character.name}">
          </div>
          <div class="col-md-8 p-3 d-flex flex-column justify-content-center align-items-center">
              
              <h5 class="card-title fs-1 mb-1 text-center">${character.name}</h5>
              <div class="d-flex justify-content-center align-items-center gap-2 mb-3">
                  <div class="${character.status}"></div>
                  <p class="m-0 firstLetter">${character.status} - ${character.species}</p>
              </div>
          </div>
      </div>
    </div>
  
  
  
  `
  card.addEventListener('click', () => openModal(character));

  cardsContainer.appendChild(card)

}

async function openModal(character){
  const modalTitle = document.getElementById('infoCharactersLabel')
  modalTitle.innerText = character.name;

  const imgElement = document.querySelector('.modal-body .img-personagem img');
  imgElement.src = character.image;
  imgElement.alt = `Imagem ${character.name}`;

  const statusElement = document.querySelector('.modal-body .status');
  const statusDiv = document.querySelector('.modal-body .divStatus');
  const speciesElement = document.querySelector('.modal-body .species');
  statusDiv.classList.add(`${character.status}`)
  statusElement.innerText = character.status;
  speciesElement.innerText = character.species;


  const originElement = document.querySelector('.modal-body .row:nth-child(3) p');
  originElement.innerText = character.origin.name;

  // Atualiza a última localização conhecida
  const locationElement = document.querySelector('.modal-body .row:nth-child(4) p');
  locationElement.innerText = character.location.name;

  // Atualiza a primeira aparição (se tiver essa informação)
  const firstSeenElement = document.querySelector('.modal-body .row:nth-child(5) p');
  firstSeenElement.innerText = await getLastEpisodeName(character);;
}

modal.addEventListener('hidden.bs.modal', function () {
  const divStatus = document.querySelector('.modal .divStatus');
  divStatus.classList.remove('Alive', 'Dead', 'unknown');
})

async function getLastEpisodeName(character) {
  try {
    const episodeURL = (character.episode[character.episode.length - 1]);
    const { data } = await api.get(`${episodeURL}`);
    return data.name

  } catch (error) {
    console.log(error);
    return 'Desconhecido';
  }
}

async function fetchFooterInfo() {
  try {
    const responseCharacter = await api.get("/character?name=" + characterName);
    totalOfCharacters = responseCharacter.data.info.count
    totalPages.innerHTML = Math.ceil(totalOfCharacters/6)

    const responseLocations = await api.get("/location");
    const totalOfLocations = responseLocations.data.info.count
    
    const responseEpisodes = await api.get("/episode");
    const totalOfEpisodes = responseEpisodes.data.info.count
    
    setFooterInfo(totalOfCharacters, totalOfLocations, totalOfEpisodes)
  
  } catch (error) {
    console.log(`Error when trying to get the footer informations: ${error}`);
  }
}

function setFooterInfo(totalOfCharacters, totalOfLocations, totalOfEpisodes){
  totalCharacters.innerText = totalOfCharacters;
  totalLocations.innerText = totalOfLocations;
  totalEpisodes.innerText = totalOfEpisodes;
}

function disableButtons() {
  if (pageView < Math.ceil(totalOfCharacters/6)) {
    buttonNext.disabled = false;
    buttonNext.classList.remove("disabled");
  } else  {
    buttonNext.disabled = true;
    buttonNext.classList.add("disabled");
  }

  if (pageView > 1) {
    buttonPrev.disabled = false;
    buttonPrev.classList.remove("disabled");
  } else {
    buttonPrev.disabled = true;
    buttonPrev.classList.add("disabled");
  }
}

function nextPage() {
  if (pageView < Math.ceil(totalOfCharacters/6)) {
    pageView++;

    setCurrentPageView(pageView);
      
    setView();
  }
}

function prevPage() {
  if (pageView > 1) {
    pageView--;
  
    setCurrentPageView(pageView);
    
    setView();
  }
}

async function start() {
  fetchFooterInfo()
  await fetchCharacters();
  setView();
}

start();