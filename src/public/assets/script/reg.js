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
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newBody)
  })
  .then (resp => resp.json())
  
  .then(data => {
    console.log(data);
    if (data.status != "success") {
      setTimeout(()=>{
        return window.location.href=data.redirectTo;
      },5000)
    }
    // window.location.href="/login"
  })
  .catch(error => {
    console.log (error)
  });
})