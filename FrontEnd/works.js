let works = window.localStorage.getItem("works");
let categories = window.localStorage.getItem("categories");
console.log("works en local = ", works);
console.log("categories en local = ", categories);

async function getWorks() {
  if (works === null) {
    const response = await fetch("http://localhost:5678/api/works");
    works = await response.json();
    console.log("work est fetch");
  } else {
    works = JSON.parse(works);
  }
  console.log(works);
  // return works;
  generateGallery(works);
}
getWorks();

async function getCategories() {
  if (categories === null) {
    const response = await fetch("http://localhost:5678/api/categories");
    categories = await response.json();
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


