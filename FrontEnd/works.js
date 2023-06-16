let storedWorks = window.localStorage.getItem("works");
let works = storedWorks ? JSON.parse(storedWorks) : [];
let categories = window.localStorage.getItem("categories");
let isAdmin = window.localStorage.getItem("admin");
let token = window.localStorage.getItem("token");

const logLink = document.getElementById("log");
if (isAdmin && token) {
  logLink.innerText = "logout";
}

const editLink = document.getElementById("edit-container");
editLink.style.display = isAdmin === "true" ? "flex" : "none";
const editBanner = document.querySelector(".edit-banner");
editBanner.style.display = isAdmin === "true" ? "flex" : "none";

// Get works data
async function getWorks() {
  if (storedWorks === null) {
    const response = await fetch("http://localhost:5678/api/works");
    works = await response.json();
    window.localStorage.setItem("works", JSON.stringify(works));
  } else {
    works = JSON.parse(storedWorks);
  }
  generateGallery(works);
  return works;
}
getWorks();

async function getCategories() {
  if (categories === null) {
    const response = await fetch("http://localhost:5678/api/categories");
    categories = await response.json();
    window.localStorage.setItem("categories", JSON.stringify(categories));
  } else {
    categories = JSON.parse(categories);
  }
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
  activeModals.push(target);
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
      if (modal === target) {
        closeModal(target);
      } else {
        closeModal();
      }
    }
  });
};

let activeModals = [];
const closeModal = function (target) {
  if (activeModals.length > 0) {
    const lastModal = target || activeModals.pop();
    lastModal.style.display = 'none';
    resetModal();
  }
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

    workContainer.setAttribute("data-id", work.id);
    trashContainer.addEventListener("click", function () {
      const workId = workContainer.dataset.id;
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
  let item = works.findIndex((element) => element.id === parseInt(workId));
  let index;
  if (item !== -1) {
    index = item;
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
    option.value = categories[i].id;
    option.innerText = categories[i].name;
    selectCategories.appendChild(option);
  }
}

//get a preview of the selected work you want to add
const fileInput = document.getElementById("file-input");

let originalAddworkModal = document.querySelector(
  ".add-file-container"
).innerHTML;

// Preview selected work photo
function previewImage(event) {
  const file = event.target.files[0];
  if (file && file.type.indexOf("image/") === 0) {
    const preview = document.querySelector(".add-file-container");
    preview.innerHTML = "";
    const img = document.createElement("img");
    img.classList.add("preview");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  }
}

fileInput.addEventListener("change", previewImage);

// empty all fields of form
function resetModal() {
  let preview = document.querySelector(".add-file-container");
  let inputs = document.querySelectorAll("input");
  preview.innerHTML = originalAddworkModal;
  fileInput.value = "";
  inputs.forEach((input) => (input.value = ""));
}

function isFormValid(form) {
  const inputs = form.querySelectorAll("input[required]");
  if (fileInput.files.length === 0) {
    alert("Veuillez sélectionner une photo");
    return false;
  }
  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].value === "") {
      return false;
    }
  }
  return true;
}

function updateSubmitButtonColor() {
  const submitBtn = document.querySelector(".validate-btn");
  const title = document.getElementById('form-title');
  const isFormFilled = title.value.length > 0;
  const isImageSelected = fileInput.files.length > 0;
  submitBtn.style.background = isFormFilled && isImageSelected ? "#1d6154" : "";
}

const form = document.getElementById("add-work-form");
const inputs = form.querySelectorAll("input[required]");

inputs.forEach((input) => {
  input.addEventListener("input", updateSubmitButtonColor);
});
fileInput.addEventListener("input", updateSubmitButtonColor);

function addWork() {
  const form = document.getElementById("add-work-form");
  const modalGallery = document.querySelector(".modal-gallery");
  const worksGallery = document.querySelector(".gallery");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (isFormValid(form)) {
      const formData = new FormData(form);
      const file = fileInput.files[0];
      formData.append("image", file);
      fetch(`http://localhost:5678/api/works/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })
        .then((response) => {
          if (response.status === 201) {
            return response.json();
          }
        })
        .then((data) => {
          alert("photo ajoutée avec succès");
          closeModal();
          works.push(data);
          modalGallery.innerHTML = "";
          generateModalGallery(works);
          worksGallery.innerHTML = "";
          generateGallery(works);
          localStorage.setItem("works", JSON.stringify(works));
        })
        .catch(console.error());
    }
  });
}
addWork();
function logout() {
  window.localStorage.removeItem("token ");
  window.localStorage.removeItem("admin");
  window.location.reload();
  logLink.innerText = "login";
}
if (logLink.innerText === "logout") {
  logLink.addEventListener("click", logout);
} else if (logLink.innerText === "login") {
  logLink.addEventListener("click", () =>
    window.location.replace("connexion.html")
  );
}
