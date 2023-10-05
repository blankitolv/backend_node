if (localStorage.getItem('cart_id')) {
  cartID = JSON.parse(localStorage.getItem('cart_id'))
  console.log ("tiene carrito: ",cartID)
} else {
  console.log("No tiene un carrito de compras asociado...")
}

const add_product_w_quantity = document.getElementById('add_product_w_quantity');
add_product_w_quantity.addEventListener('click',async()=>{
  const product_title = document.getElementById('product_title').textContent.toLowerCase()
  notification({ msg: `Se agregó <b>${product_title} </b> al carrito`, icon:'success', timer: 2000})
  // notification2()
  const inputQuantity = document.getElementById('inputQuantity').value;
  const uid = add_product_w_quantity.getAttribute('data-product_id')
  createAnimation(add_product_w_quantity,'animate__bounceIn', 1000)
  let bandera
  if (cartID == "") {
    console.log ("es vacio")
    const product = [{ id: uid, quantity: inputQuantity }]
    fetch('/api/carts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status != 'success') {
        throw new Error ("error en el carrito")
      }
      localStorage.setItem('cart_id',JSON.stringify(data.payload))
      notification({ msg: 'carrito creado y producto agregado', icon:'success', timer: 2000})
    })
    .catch(error => {
      bandera = { msg: 'error en el carrito', icon:'error', timer: 2000}
      notification(bandera.msg, bandera.icon, bandera.timer)
      console.log (error)
    })

    // try {
    //   const product = [{ id: uid, quantity: inputQuantity }]
    //   const response = await fetch('/api/carts', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify(product)
    //   })
    //   if (response.ok) {
    //       const data = await response.json();
    //       localStorage.setItem('cart_id',JSON.stringify(data.payload))
    //       bandera = { msg: 'carrito creado y producto agregado', icon:'success', timer: 2000}
    //       await notification(bandera.msg, bandera.icon, bandera.timer)
    //       console.log(data);
    //   } else {
    //       // La solicitud no fue exitosa
    //       throw new Error(`Error en la solicitud: ${response.status} ${response.message}`);
    //   }
    // } catch (err) {
    //     console.log(err);
    // }

  } else {
    try {
      const URL = `/api/carts/${cartID}/product/${uid}`
      console.log(URL);
      const response = await fetch(URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: inputQuantity })
      });
  
      if (response.ok) {
          const data = await response.json();
          localStorage.setItem('cart_id',data.payload)
          bandera = { msg: 'carrito actualizado', icon:'success', timer: 2000}
          await notification(bandera.msg, bandera.icon, bandera.timer)


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

const notification = async(obj) => {
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
const notification2 = async() => {
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