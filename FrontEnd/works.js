export let baseApiUrl = "http://localhost:5678/api";
let works = [];
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

async function getWorks() {
  const response = await fetch(`${baseApiUrl}/works`);
  works = await response.json();
  return works;
}

async function resetWorks() {
  const allWorks = await getWorks();
  const gallerySection = document.querySelector(".gallery");
  gallerySection.innerHTML = "";
  generateGallery(allWorks);
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = "";
  generateModalGallery(allWorks);
}

async function getCategories() {
  if (categories === null) {
    const response = await fetch(`${baseApiUrl}/categories`);
    categories = await response.json();
    window.localStorage.setItem("categories", JSON.stringify(categories));
  } else {
    categories = JSON.parse(categories);
    addFilterListener(categories, works);
  }
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

// Generates the filters button in DOM
function generateFilters(categories) {
  categories.forEach((category) => {
    const filterContainer = document.querySelector(".filters");
    const filterBtn = document.createElement("button");
    filterBtn.classList.add("filter-btn");
    filterBtn.innerText = category.name;
    filterContainer.appendChild(filterBtn);
  });
}

// this listener actives the display of selected works only and handle the change of the focused filter
function addFilterListener(categories, works) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const filterButtonAll = document.querySelector(".filter-btn-all");

  filterButtons.forEach((button, i) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((button) => {
        button.classList.remove("active"); // Remove active class from all buttons
      });
      filterButtonAll.classList.remove("active");
      button.classList.add("active");
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

  //handles the case of the "TOUS" button
  filterButtonAll.addEventListener("click", () => {
    filterButtons.forEach((button) => {
      button.classList.remove("active");
    });
    filterButtonAll.classList.add("active");
    const gallerySection = document.querySelector(".gallery");
    gallerySection.innerHTML = "";
    generateGallery(works);
  });
}

async function createDOMelements() {
  await getWorks();
  await getCategories();
  generateGallery(works);
  generateFilters(categories);
  addFilterListener(categories, works);
}

createDOMelements();

//modify works modal
let modal = null;
const openModal = async function (e) {
  e.preventDefault();
  const allWorks = await getWorks();
  const target = document.querySelector(e.target.getAttribute("href"));
  target.style.display = "flex";
  activeModals.push(target);
  modal = target;
  document.getElementsByClassName("modal-gallery")[0].innerHTML = " ";
  generateModalGallery(allWorks);
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
const closeModal = async function (target) {
  if (activeModals.length > 0) {
    const lastModal = target || activeModals.pop();
    lastModal.style.display = "none";
    resetModal();
    resetWorks();
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
  fetch(`${baseApiUrl}/works/${workId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        alert("Photo supprimée avec succès");
        works.splice(index, 1);
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

function previewImage() {
  const previewContainer = document.getElementById("preview-container");
  const previewImage = document.getElementById("preview-image");
  const fileInputContainer = document.getElementById("file-input-container");
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function () {
      previewImage.src = reader.result;
      previewContainer.style.display = "block";
      fileInputContainer.style.display = "none";
    };

    reader.readAsDataURL(file);
  }
}

fileInput.addEventListener("change", previewImage);

function resetModal() {
  const previewContainer = document.getElementById("preview-container");
  const fileInputContainer = document.getElementById("file-input-container");

  fileInput.value = "";
  previewContainer.style.display = "none";
  fileInputContainer.style.display = "flex";
  let inputs = document.querySelectorAll("input");
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
  const title = document.getElementById("form-title");
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
      fetch(`${baseApiUrl}/works/`, {
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
        .then(async () => {
          alert("photo ajoutée avec succès");
          closeModal();
          modalGallery.innerHTML = "";
          const allWorks = await getWorks();
          generateModalGallery(allWorks);
          worksGallery.innerHTML = "";
          generateGallery(allWorks);
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
