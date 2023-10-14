const nav_logout_btn = document.getElementById('nav_logout_btn')
const nav_login_btn = document.getElementById('nav_login_btn')
const nav_register_btn = document.getElementById('nav_register_btn')
document.addEventListener("DOMContentLoaded", async function () {
  if (window.location.pathname === "/login") {
    nav_login_btn.setAttribute("hidden","true")
  }
  fetch("/api/users/authstatus")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.authenticated) {
        // usuario autenticado
        nav_logout_btn.removeAttribute('hidden');
      } else {
        console.log("SALIO POR ELSE")
        if (window.location.pathname != "/login") {
          nav_login_btn.removeAttribute('hidden');
        }
        nav_register_btn.removeAttribute('hidden');
      }
    })
    .catch((error) => {
      console.error("Error al verificar el estado de autenticación:", error);
    });
    nav_logout_btn.addEventListener('click', logout, false)
    nav_login_btn.addEventListener('click', login, false)
    nav_register_btn.addEventListener('click', register, false)
});

const logout = () => {
  fetch("/api/users/logout")
  .then(response => {
    if (!response.ok) {
      throw new Error('La solicitud no fue exitosa');
    }
  })
  .then(()=>{
    location.reload();
  })
  .catch((error) => {
    console.log(error);
    location.reload();
  });
  nav_logout_btn.setAttribute('hidden',"");
}
const login = () => window.location.href='/login'

const register = () =>  window.location.href='/register'

