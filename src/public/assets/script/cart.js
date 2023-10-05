let cartID = ""

const vaciarDOM = (element)=> {
  while (element.firstChild){
    element.removeChild(element.firstChild);
  };
}


document.addEventListener('DOMContentLoaded', async function() {
  if (localStorage.getItem('cart_id')) {
    cartID = JSON.parse(localStorage.getItem('cart_id'))
    console.log ("tiene carrito: ",cartID)
  } else {
    console.log("No tiene un carrito de compras asociado...")
  }
  const nav_cart = document.getElementById('nav_cart')
  if (cartID==""){
    nav_cart.classList.add("disabled");
  } else {
    nav_cart.addEventListener("click",async()=>{
      
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

  })
  }

});

const fetch_cart_products = async() => {
  try {
    const response = await fetch(`/api/carts/${cartID}`, {
      method: 'GET',
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