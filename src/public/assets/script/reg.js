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
  .then(response => response.json())
  .then(data => {
    console.log(">>>>",data)
    console.log(">>>>",data.status)
    console.log(">>>>",data.message)
    if (data.status != "success") {
      throw new Error (data.message) 
    }
    // if (data.status != 'success') {
    //   console.log("NO FUE EXITOSO")
    //   throw new Error(data.message);
    // }
    window.location.href="/login"
  })
  .catch(error => {
    console.log("SALIO POR CATCH",error)
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: error.message
    })
    console.error('Ocurrió un error:', error.message);
    console.error('enviado: ',newBody);
  });
})