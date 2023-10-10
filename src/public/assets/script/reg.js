const form_reg = document.getElementById('form_reg')
form_reg.addEventListener('submit',(e)=>{
  e.preventDefault();
  const data = new FormData(form_reg);
  let newBody = {} 
  data.forEach((valor, clave) => {
    if (clave == "registration_code") {
      valor = valor.replaceAll(" ","").toLowerCase();
    }
    newBody[clave] = valor;
  });

  fetch('/api/users/reg',{
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
    window.location.href="/login"
    console.log(data); // Hacer algo con los datos recibidos
  })
  .catch(error => {
    console.error('Ocurrió un error:', error);
    console.error('enviado: ',newBody);
  });
})