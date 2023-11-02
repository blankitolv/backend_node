let cartID = ""

const vaciarDOM = (element)=> {
  while (element.firstChild){
    element.removeChild(element.firstChild);
  };
}

const  verifyToken = async () =>{
  console.log("verificando token... ... ...")
  const token = JSON.parse(localStorage.getItem('notflixToken'));
  if (token){
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token.accessToken);
    await fetch('/api/users/verifyAuth',{
      method:'POST',
      headers: headers
    })
    .then(resp => {
      if (resp.ok){
        glb_token = token.accessToken
        console.log("mmm... te podés quedar");
      } else {
        console.log("1 NO TE podés quedar");
        const goto ="login";
        const currentURL = window.location.href;
        const actual = currentURL.split("/")
        if (!actual.includes(goto)) {
          window.location.href="/"+goto;
        }    
      }
    })
    .catch(error => {
      console.log(error.message)
      console.log("HUBO UN ERROR")
    })
  } else {
    const goto ="login";
    const currentURL = window.location.href;
    const actual = currentURL.split("/")
    if (!actual.includes(goto)) {
      window.location.href="/"+goto;
    }
    
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  await verifyToken();
  if (localStorage.getItem('cart_id')) {
    cartID = JSON.parse(localStorage.getItem('cart_id'))
    console.log ("tiene carrito: ",cartID)
    document.getElementById('input_cart_id').value = cartID;
  } else {
    console.log("No tiene un carrito de compras asociado...")
  }
  const nav_cart = document.getElementById('nav_cart')
  if (cartID==""){
    nav_cart.classList.add("disabled");
  } else {
    nav_cart.addEventListener("click", handle_cart )
  }
  const future_action = document.querySelectorAll('.future_action')
  future_action.forEach(element => {
    element.addEventListener('click',(e)=>{
      e.preventDefault();
      notification({ msg: `PROXIMAMENTE`, icon:'info', timer: 3000})
    })
  });

});

const fetch_cart_products = async() => {
  try {
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + glb_token);
    headers.append('Content-Type', 'application/json');
    const response = await fetch(`/api/carts/${cartID}`, {
      method: 'GET',
      headers:headers,
    });

    if (!response.ok) {
      throw new Error("Error en la solicitud al carrito");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    const bandera = { msg: 'error en el carrito', icon: 'error', timer: 2000 };
    notification(bandera.msg, bandera.icon, bandera.timer);
    console.log(error);
    return null;
  }
}
const handle_cart = async () => {
  try {
    const products = await fetch_cart_products();
    console.log(products)
    if (products == null) {
      throw new Error("Error en el carrito de productos")
    }
    const canvas_cart_box = document.getElementById('canvas_cart_box');
    vaciarDOM(canvas_cart_box);
    let total = 0;
    document.getElementById('cart_count').textContent = products.payload.products.length
    products.payload.products.forEach(oneProduct => {
      let element_li = document.createElement('li');
      element_li.innerHTML = `
      <li class="list-group-item d-flex justify-content-between lh-sm">
        <div>
        <h6 class="my-0">${oneProduct.product.title}</h6>
        <small class="text-body-secondary">${oneProduct.product.category}</small>
        </div>
        <span class="text-body-secondary">${oneProduct.quantity} x ${oneProduct.product.price}</span>
        </li>
        `
      console.log("QUANTITY: ",oneProduct.quantity, "typeof: ", typeof oneProduct.quantity)
      console.log("PRICE: ",oneProduct.product.price, "typeof:", typeof oneProduct.product.price)
      // let aux = oneProduct.quantity * oneProduct.product.price
      // console.log("AUXXX: ",aux);
      total += (oneProduct.quantity * oneProduct.product.price);
      canvas_cart_box.append(element_li)
      });
      let element_li = document.createElement('li');
      element_li.innerHTML =  `
      <li class="list-group-item d-flex justify-content-between">
        <span>USD ${total}</span>
        <strong></strong>
      </li>
    `
      canvas_cart_box.append(element_li);  
  } catch (error) {
    console.log("error ->->->",error.message)
  }
}

const form_canvas_cart = document.getElementById('form_canvas_cart')
form_canvas_cart.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form_canvas_cart);
  const cart_id = data.get("cartid");
  window.location.href = "/cart/"+cart_id;
})

const notification = async(obj) => {
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

