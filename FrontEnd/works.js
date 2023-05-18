let works = window.localStorage.getItem("works");
let categories = window.localStorage.getItem("categories");
let isAdmin = window.localStorage.getItem("isAdmin");
const editLink = document.getElementById('edit-container');
editLink.style.display = isAdmin === 'true' ? 'flex' : 'none';
async function getWorks() {
  if (works === null) {
    const response = await fetch("http://localhost:5678/api/works");
    works = await response.json();
    window.localStorage.setItem("works", JSON.stringify(works));

    console.log("work est fetch");
  } else {
    works = JSON.parse(works);
  }
  console.log(works);
  generateGallery(works);
}
getWorks();

async function getCategories() {
  if (categories === null) {
    const response = await fetch("http://localhost:5678/api/categories");
    categories = await response.json();
    window.localStorage.setItem("categories", JSON.stringify(categories));
    console.log("categories est fetch");
  } else {
    categories = JSON.parse(categories);
  }
  console.log(categories);
  generateFilters(categories);
  addFilterListener(categories, works);
}

getCategories();

function generateFilters(categories) {
  categories.forEach((category) => {
    const filterContainer = document.querySelector(".filters");
    const filterBtn = document.createElement("button");
    filterBtn.classList.add("filter-btn");
    filterBtn.innerText = category.name;
    filterContainer.appendChild(filterBtn);
  });
}

// Generates the gallery with all works
function generateGallery(works) {
  works.forEach((work) => {
    const gallerySection = document.querySelector(".gallery");
    const workContainer = document.createElement("figure");

    const workImage = document.createElement("img");
    workImage.src = work.imageUrl;

    const workTitle = document.createElement("figcaption");
    workTitle.textContent = work.title;

    workContainer.appendChild(workImage);
    workContainer.appendChild(workTitle);
    gallerySection.appendChild(workContainer);
  });
}

function addFilterListener(categories, works) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((button, i) => {
    button.addEventListener("click", () => {
      const selectedCategoryId = categories[i].id;
      const selectedWorks = [];
      works.forEach((work) => {
        if (work.categoryId == selectedCategoryId) {
          selectedWorks.push(work);
        }
      });
      const gallerySection = document.querySelector(".gallery");
      gallerySection.innerHTML = "";
      generateGallery(selectedWorks);
    });
  });
  const filterButtonAll = document.querySelector(".filter-btn-all");
  filterButtonAll.addEventListener("click", () => {
    const gallerySection = document.querySelector(".gallery");
    gallerySection.innerHTML = "";
    generateGallery(works);
  });
}

//modify works gallery modal
let modal = null;
const openModal = function(e) {
  e.preventDefault();
  const target = document.querySelector(e.target.getAttribute('href'));
  target.style.display = "flex";
  modal = target;
  generateModalGallery(works);
  
  modal.addEventListener('click', function(event){
    if(event.target.matches('.close-icon') || event.target.matches(".modal")){
      closeModal();
    }
  });
};

const closeModal = function() {
  modal.style.display= 'none';
  modal = null;
};

document.querySelectorAll('.js-modal').forEach(a => {
  a.addEventListener('click', openModal);

});

function generateModalGallery(works) {
  works.forEach((work) => {
    const modalGallery = document.querySelector('.modal-gallery');
    const workContainer = document.createElement('div');
    workContainer.classList.add('modal-work-container');

    const thumbnails = document.createElement('figure');
    thumbnails.classList.add('thumbnails');
    thumbnails.style.backgroundImage = `url(${work.imageUrl})`;

    const trashContainer = document.createElement('div');
    trashContainer.classList.add('trash-container');
    const trashIcon = document.createElement('img');
    trashIcon.src = './assets/icons/trash-can-filled-24.png';
    trashIcon.classList.add('trash-icon');
    const edit = document.createElement('p');
    edit.innerText = "éditer";

    trashContainer.appendChild(trashIcon);
    thumbnails.appendChild(trashContainer);
    workContainer.appendChild(thumbnails);
    workContainer.appendChild(edit);
    modalGallery.appendChild(workContainer);
  });
}
