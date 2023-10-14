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
  .then(res => res.json())
  .then(data => {
    if (data.status == "success") {
      window.location.href="/products"
    }
    // window.location.replace("/chat");
    // console.log(data); // Hacer algo con los datos recibidos
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
    console.error('enviado: ',newBody);
  });
})