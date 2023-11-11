console.log("oneProduct.js charge")
let glb_token = ""
const  verifyToken = async () =>{
  console.log("verificando token... ... ...")
  const token = JSON.parse(localStorage.getItem('notflixToken'));
  if (token){
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token.accessToken);
    await fetch('/api/users/verifyAuth',{
      method:'GET',
      headers: headers
    })
    .then(resp => {
      if (resp.ok){
        glb_token = token.accessToken
        console.log("mmm... te podés quedar");
      } else {
        console.log("1 NO TE podés quedar");
        window.location.href="/login";
      }
    })
    .catch(error => {
      console.log(error.message)
      console.log("HUBO UN ERROR")
    })
  } else {
    console.log("2 NO TE podés quedar");
    window.location.href="/login";
  }
}

document.addEventListener("DOMContentLoaded", verifyToken, true);


if (localStorage.getItem('cart_id')) {
  cartID = JSON.parse(localStorage.getItem('cart_id'))
  console.log ("tiene carrito: ",cartID)
  document.getElementById('input_cart_id').value = cartID;
} else {
  console.log("No tiene un carrito de compras en ls...")
}

const add_product_w_quantity = document.getElementById('add_product_w_quantity');
add_product_w_quantity.addEventListener('click',async()=>{
  const product_title = document.getElementById('product_title').textContent.toLowerCase()
  noty({ msg: `Se agregó <b>${product_title} </b> al carrito`, icon:'success', timer: 2000})
  // noty2()
  const inputQuantity = document.getElementById('inputQuantity').value;
  const uid = add_product_w_quantity.getAttribute('data-product_id')
  createAnimation(add_product_w_quantity,'animate__bounceIn', 1000)
  let bandera
  if (cartID == "") {
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + glb_token);
    headers.append('Content-Type', 'application/json');
    const product = [{ id: uid, quantity: inputQuantity }]
    fetch('/api/carts', {
      method: 'POST',
      headers:headers,
      body: JSON.stringify(product)
    })
    .then(res => {
      if (res.status == 401){
        console.log("401")
        console.log ("token: ",glb_token)
        console.log ("product: ",product)
        // window.location.href="/login";
      } else if (res.status == 400){
        console.log("400")
        console.log ("token: ",glb_token)
        console.log ("product: ",product)
      } else if (res.status <300) {
        return res.json()
      } else if (res.status == 500){
        console.log("500")
        console.log ("token: ",glb_token)
        console.log ("product: ",product)
      }
    })
    .then(data => {
      console.log("ESTO ES DATA: ",data)
      localStorage.setItem('cart_id',JSON.stringify(data.payload._id));
      cartID = data.payload._id;
      console.log("SE CREO: ",data.payload);
      document.getElementById('input_cart_id').value = cartID;
      document.getElementById("nav_cart").classList.remove("disabled");
      handle_cart()
      noty({ msg: 'carrito creado y producto agregado', icon:'success', timer: 2000})
    })
    .catch(error => {
      console.log("HUBO ERROR")
      bandera = { msg: 'error en el carrito', icon:'error', timer: 2000}
      noty(bandera.msg, bandera.icon, bandera.timer)
      console.log (error)
    })

  } else {
    try {
      const URL = `/api/carts/${cartID}/product/${uid}`
      console.log(URL);
      const headers = new Headers();
      headers.append('Authorization', 'Bearer ' + glb_token);
      headers.append('Content-Type', 'application/json');
      const response = await fetch(URL, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ quantity: inputQuantity })
      });
  
      if (response.ok) {
          const data = await response.json();
          localStorage.setItem('cart_id',data.payload)
          handle_cart()
          bandera = { msg: 'carrito actualizado', icon:'success', timer: 2000}
          await noty(bandera.msg, bandera.icon, bandera.timer)
          console.log(data);
      } else {
          // La solicitud no fue exitosa
          throw new Error(`Error en la solicitud: ${response.status} ${response.message}`);
      }
    } catch (err) {
        console.log(err);
    }
  }
})

const createAnimation = (this_element, this_class, timer)=>{
  this_element.classList.add(this_class);
  setTimeout(()=>{
    console.log("eliminando clase")
    this_element.classList.remove(this_class);
  },timer)
}

const noty = async(obj) => {
  console.log("LA NOTIFICACION ",obj.msg)
  const Toast = Swal.mixin({
    backdrop: true,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: obj.timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  
  Toast.fire({
    icon: obj.icon,
    title: obj.msg
  })
}
const noty2 = async() => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })
  
  Toast.fire({
    icon: 'success',
    title: 'Signed in successfully'
  })
}