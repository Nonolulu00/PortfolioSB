let works = window.localStorage.getItem("works");
let categories = window.localStorage.getItem("categories");
let isAdmin = window.localStorage.getItem("admin");
let token = window.localStorage.getItem("token");

const editLink = document.getElementById("edit-container");
editLink.style.display = isAdmin === "true" ? "flex" : "none";

async function getWorks() {
  if (works === null) {
    const response = await fetch("http://localhost:5678/api/works");
    works = await response.json();
    window.localStorage.setItem("works", JSON.stringify(works));
  } else {
    works = JSON.parse(works);
  }
  console.log(works);
  generateGallery(works);
  return works;
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

//modify works modal
let modal = null;
const openModal = function (e) {
  e.preventDefault();
  const target = document.querySelector(e.target.getAttribute("href"));
  target.style.display = "flex";
  modal = target;
  document.getElementsByClassName("modal-gallery")[0].innerHTML = " ";
  generateModalGallery(works);
  generateSelectButton();
  modal.addEventListener("click", function (event) {
    if (
      event.target.matches(".close-icon") ||
      event.target.matches(".back-icon") ||
      event.target.matches(".modal")
    ) {
      closeModal();
    }
  });
};

const closeModal = function () {
  if (modal) {
    modal.style.display = "none";
  }
  modal = null;
  resetModal();
};

document.querySelectorAll(".js-modal").forEach((a) => {
  a.addEventListener("click", openModal);
});

function generateModalGallery(works) {
  works.forEach((work) => {
    const modalGallery = document.querySelector(".modal-gallery");
    const workContainer = document.createElement("div");
    workContainer.classList.add("modal-work-container");

    const thumbnails = document.createElement("figure");
    thumbnails.classList.add("thumbnails");
    thumbnails.style.backgroundImage = `url(${work.imageUrl})`;

    const trashContainer = document.createElement("div");
    trashContainer.classList.add("trash-container");
    const trashIcon = document.createElement("img");
    trashIcon.src = "./assets/icons/trash-can-filled-24.png";
    trashIcon.classList.add("trash-icon");
    const edit = document.createElement("p");
    edit.innerText = "éditer";

    workContainer.dataset.id = work.id;
    trashContainer.addEventListener("click", function () {
      const workId = workContainer.dataset.id;
      console.log("Trash clicked");
      console.log("Work ID:", workId);
      deleteWork(workId);
    });

    trashContainer.appendChild(trashIcon);
    thumbnails.appendChild(trashContainer);
    workContainer.appendChild(thumbnails);
    workContainer.appendChild(edit);
    modalGallery.appendChild(workContainer);
  });
}

function deleteWork(workId) {
  const modalGallery = document.querySelector(".modal-gallery");
  const worksGallery = document.querySelector(".gallery");
  let item = works.find((element) => element.id === workId);
  let index = 0;
  if (item) {
    index = works.indexOf(item);
  }
  fetch(`http://localhost:5678/api/works/${workId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        alert("Photo supprimée avec succès");
        works.splice(index, 1);
        window.localStorage.setItem("works", JSON.stringify(works));
        modalGallery.innerHTML = "";
        generateModalGallery(works);
        worksGallery.innerHTML = "";
        generateGallery(works);
      } else if (response.status === 401) {
        alert(`Vous n'êtes pas autorisé à supprimer cette photo`);
      }
    })

    .catch(console.error());
}
//get categories to generate select dropdown in add work modal
function generateSelectButton() {
  let selectCategories = document.querySelector(".select-categories");
  selectCategories.innerHTML = "";
  for (let i = 0; i < categories.length; i++) {
    let option = document.createElement("option");
    option.classList.add("select-option");
    option.value = categories[i].name;
    option.innerText = categories[i].name;
    selectCategories.appendChild(option);
  }
}

//get a preview of the selected work you want to add
let addButton = document.querySelector(".add-file-input");
let originalAddworkModal = document.querySelector(
  ".add-file-container"
).innerHTML;

function previewImage(event) {
  let file = event.target.files[0];
  if (file && file.type.indexOf("image/") === 0) {
    let preview = document.querySelector(".add-file-container");
    preview.innerHTML = "";
    const img = document.createElement("selected-img");
    img.classList.add("preview");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  }
}
addButton.addEventListener("change", previewImage);

function resetModal() {
  let preview = document.querySelector(".add-file-container");
  preview.innerHTML = originalAddworkModal;
  addButton.value = "";
}
function addWork() {
  // const addButton = document.querySelector('.add-btn');
  const form = document.getElementById("add-work-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    console.log(isFormValid(form));
    if (isFormValid(form)) {
      const formData = new FormData(form);
      console.log(formData);
    }
    else{
      console.log("nope");
    }
  });
  // addButton.addEventListener("submit", function (event) {
  //   event
  // })
}
addWork();
// check is all inputs are filled
function isFormValid(form) {
  const inputs = form.querySelectorAll("input[required]");
  const image = document.querySelector('.selected-img');
  if(!image){
    console.log("pas dimage");
    return false;
  }
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === "") {
      return false;
    }
  }
  return true; 
}