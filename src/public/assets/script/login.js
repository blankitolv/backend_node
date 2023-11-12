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
    console.log("ESTE ES DATA: ",data);
    console.log("ESTE ES DATA.PAYLOAD: ",data.payload);
    localStorage.setItem('notflixToken',JSON.stringify(data.payload))
    window.location.href="/products";
  })
  .then(() => console.log(JSON.parse(localStorage.getItem('notflixToken'))))
  .catch(error => {
    console.error('Ocurrió un error:', error);
    console.error('enviado: ',newBody);
  });
})