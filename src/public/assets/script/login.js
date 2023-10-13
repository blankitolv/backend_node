console.log("LOGIN");
const form_login = document.getElementById('form_login')
form_login.addEventListener('submit',(e)=>{
  e.preventDefault();
  console.log("SUBMIT")
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
  .then(response => {
    if (!response.ok) {
      throw new Error('La solicitud no fue exitosa');
    }
    return response.json(); // Parsear la respuesta JSON
  })
  .then(data => {
    console.log("ALL OK")
    window.location.replace("/chat");
    console.log(data); // Hacer algo con los datos recibidos
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
    console.error('enviado: ',newBody);
  });
})