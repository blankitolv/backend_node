const socket = io();
// es una función que retorna un numero entero para
// generar imagenes de perros distintos
const randomNum = ()=>{
  return Math.floor(Math.random() * 8) + 1;
}

const form_create_product = document.getElementById('form_create_product');
form_create_product.addEventListener('submit',async (e)=>{
  e.preventDefault();
  const formData = new FormData(form_create_product);

  fetch('/api/products',{
    method:'POST',
    body: formData,
  })
  .then(resp => resp.json())
  .then(data => {
    if (data.status === 'success') {
      console.log ("Producto cargado")
    }
  })
  .catch(err =>{
    console.log(err)
  })
  .finally(()=>{
    form_create_product.reset();
  })

  // for (const entry of formData.entries()) {
  //   const [name, value] = entry;
  //   console.log(`${name}: ${value}`);
  // }


  // try {
  //   const response = await fetch(`/api/products/${uid}`, {
  //       method: 'DELETE'
  //   });

  //   if (response.ok) {
  //       // La solicitud fue exitosa (código de estado 200)
  //       const data = await response.json();
  //       console.log(data);
  //   } else {
  //       // La solicitud no fue exitosa, maneja el error apropiadamente
  //       throw new Error(`Error en la solicitud: ${response.status}`);
  //   }
  // } catch (err) {
  //     console.log(err);
  // }

})

// acomoda los productos recibidos del websocket
const addProducts = async (data) =>{
  if (data.length == 0) {
    return
  }

  const urlActual = window.location.href;
  console.log(urlActual);
  
  // está en http://localhost:8080/realtime sigue, sino retorna
  let divd = urlActual.split('/') 
  const res = divd.filter(e => e == "realtime")
  if (res.length==0) {
    return
  }
  console.log (data)

  // agrega los productos al dom
  const app = document.getElementById('realtime_list_products')
  let html =`
  <div class="container-fluid bg-dark text-light" style="min-height: 95vh;">
  <div id="cards_container" class="row row-cols-xs-2 row-cols-lg-4 row-cols-sm-2 row-cols-md-3 g-3">
`;
  data.payload.forEach(oneMovie => {
    const num = randomNum()
    const num2 = randomNum()
    html +=`
        <div class="col col_product d-flex align-items-stretch" data-product-id="${oneMovie._id}">
            <div class="card bg-dark text-light shadow p-3 mb-5 rounded" style="width: 15rem;">
              <a href="/api/products/${oneMovie._id}"}>
                <img src=${oneMovie.thumbnail.length == 0 ?`https://placedog.net/20${num2}/30${num}`:"./img/"+oneMovie.thumbnail[0]} class="card-img-top" alt="poster pelicula"/>
              </a>
              <div class="card-body">
                <h5 class="card-title">${oneMovie.title}</h5>
                <div class="container" data-product-id="${oneMovie._id}">
                  <button class="btn btn-danger delete_product"><i class="bi bi-trash3 p-2 m-2"></i>Delete</button>
                </div>
              </div>
            </div>
        </div>
    `
  });

  html += `    </div>
  </div>`
  app.innerHTML = html;
  event_delete();
}
const event_delete = () => {
  const delete_button = document.querySelectorAll('.delete_product')
  delete_button.forEach(each_button => {
    each_button.addEventListener('click',async(e)=>{
      const uid = e.target.parentNode.getAttribute('data-product-id');
      await delete_fetch_product (uid)
    })
  });
}
const delete_fetch_product = async (uid) => {
  console.log ("se quiere eliminar el producto con id: ",uid)
  try {
    const response = await fetch(`/api/products/${uid}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
    } else {
        // La solicitud no fue exitosa
        throw new Error(`Error en la solicitud: ${response.status}`);
    }
  } catch (err) {
      console.log(err);
  }
}
// al principio solicita los productos en un mensaje -> message: "allProducts"
socket.emit("message","allProducts")

// cuando recibe un mensaje "allProducts" agrega los elementos al dom
socket.on('allProducts',async(data)=>{
 try {
  await addProducts(data)
 } catch (e){
  console.log(e)
 }
})

// si recibe un mensaje "del_product" borra ese elemento del dom
socket.on('del_product',(data) => {
  console.log ("borrá un producto: ",data)
  const col_product = document.querySelectorAll('.col_product')
  col_product.forEach(each => {
    console.log ("attr: ",each.getAttribute('data-product-id'))
    // Comprobamos si el valor de data-product-id es igual a 15
    if (each.getAttribute('data-product-id') == data.uid) {
      each.remove();
    }
  });
})

// si recibe un mesaje "new_product" incorpora un producto al dom
socket.on('new_products',(data)=>{
  console.log("nuevo producto", data)
  const num = randomNum()
  const num2 = randomNum()
  const card_container = document.getElementById('cards_container')
  const div_col = document.createElement('div');
  div_col.className = "col"
  div_col.innerHTML +=`
    <div class="col col_product d-flex align-items-stretch" data-product-id="${data._id}">
      <div class="card bg-dark text-light shadow p-3 mb-5 rounded" style="width: 15rem;">
        <a href="/api/products/${data.uid}"}>
          <img src=${data.thumbnail.length == 0?`https://placedog.net/20${num2}/30${num}`:"./img/"+data.thumbnail[0]} class="card-img-top" alt="poster pelicula"/>
        </a>
        <div class="card-body">
          <h5 class="card-title">${data.title}</h5>
          <div class="container" data-product-id="${data._id}">
            <button class="btn btn-danger delete_product"><i class="bi bi-trash3 p-2 m-2"></i> Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
  card_container.append(div_col)
  event_delete()
})


