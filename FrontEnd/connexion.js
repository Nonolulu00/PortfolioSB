/* eslint-disable no-unused-vars */
// @ts-ignore
export let isAdmin =false;
export function sendConnexionData() {
  const form = document.getElementById("connexion-form");
  const email = document.getElementById("email");

  //email format error message
  if(email){

    email.addEventListener("keyup", function (event) {
      if (email.validity.typeMismatch) {
        email.setCustomValidity(
          "Votre email ne respecte pas le format nom@domain.fr"
        );
      } else {
        email.setCustomValidity("");
      }
    });
  }
  if(form){

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const connexionData = {
        email: event.target.querySelector("[name=email]").value,
        password: event.target.querySelector("[name=password]").value,
      };
      fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(connexionData),
      }).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            const token = data.token;
            const userId = data.userId;
            userId === 1 ? isAdmin = true : isAdmin = false;
            localStorage.setItem("token", token);
            localStorage.setItem('admin', isAdmin);
            window.location.replace("index.html");
          });
          form.reset();
        } else {
          throw new Error(alert("E-mail ou mot de passe erroné"));
        }
      });
    });
  }

}
sendConnexionData();
