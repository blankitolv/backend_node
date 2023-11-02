console.log("LOGIN");
const form_login = document.getElementById('form_login')
form_login.addEventListener('submit',(e)=>{
  e.preventDefault();
  const data = new FormData(form_login);
  let newBody = {} 
  data.forEach((valor, clave) => {
    newBody[clave] = valor;
  });

  fetch('/api/users/login',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newBody)
  })
  .then(res => {
    if (res.ok) {
      console.log("FUE OK");
      return res.json();
    } else {
      throw new Error("Error en el logueo")
    }
  })
  .then(data => {
    console.log(data);
    localStorage.setItem('notflixToken',JSON.stringify(data.payload))
    // const raw_token = localStorage.getItem('notflixToken')
    // const decodedToken = JSON.parse(atob(raw_token.split('.')[1]));
    // console.log("DECODEDTOKEN: ",decodedToken)
    
    window.location.href="/products";
    
    // window.location.replace("/chat");
    // console.log(data); // Hacer algo con los datos recibidos
  })
  .then(() => console.log(JSON.parse(localStorage.getItem('notflixToken'))))
  .catch(error => {
    console.error('Ocurrió un error:', error);
    console.error('enviado: ',newBody);
  });
})