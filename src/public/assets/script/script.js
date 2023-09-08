const socket = io();
const randomNum = ()=>{
  return Math.floor(Math.random() * 8) + 1;
}

const addProducts = async (data) =>{
  if (data.length == 0) {
    return
  }
  const urlActual = window.location.href;
  console.log(urlActual);
  
  let divd = urlActual.split('/') 
  const res = divd.filter(e => e == "realtime")
  if (res.length==0) {
    return
  }
  const app = document.getElementById('realtime_list_products')
  let html =`
  <div class="container-fluid bg-dark text-light" style="min-height: 95vh;">
  <div id="cards_container" class="row row-cols-xs-2 row-cols-lg-4 row-cols-sm-2 row-cols-md-3 g-3">
`;
  data.forEach(oneMovie => {
    const num = randomNum()
    html +=`
        <div class="col col_product d-flex align-items-stretch" data-product-id="${oneMovie.uid}">
            <div class="card bg-dark text-light shadow p-3 mb-5 rounded" style="width: 15rem;">
              <a href="/api/products/${oneMovie.uid}"}>
                <img src=${oneMovie.thumbnail == 'N/C'?`https://placedog.net/200/30${num}`:"./img/"+oneMovie.thumbnail[0]} class="card-img-top" alt="poster pelicula"/>
              </a>
              <div class="card-body">
                <h5 class="card-title">${oneMovie.title}</h5>
                <div class="container" data-product-id="${oneMovie.uid}">
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
  const delete_button = document.querySelectorAll('.delete_product')
  delete_button.forEach(each_button => {
    each_button.addEventListener('click',async(e)=>{
      const uid = e.target.parentNode.getAttribute('data-product-id');
      console.log ("se quiere eliminar el producto con id: ",uid)
      try {
        const response = await fetch(`/api/products/${uid}`, {
            method: 'DELETE'
        });
    
        if (response.ok) {
            // La solicitud fue exitosa (código de estado 200)
            const data = await response.json();
            console.log(data);
        } else {
            // La solicitud no fue exitosa, maneja el error apropiadamente
            throw new Error(`Error en la solicitud: ${response.status}`);
        }
      } catch (err) {
          console.log(err);
      }
    })
  });

}
socket.emit("message","allProducts")
socket.on('allProducts',async(data)=>{
 try {
  await addProducts(data)
 } catch (e){
  console.log(e)
 }
})
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

socket.on('new_products',(data)=>{
  console.log ("nuevo producto")
  console.log (data)
  console.log (data.uid)
  console.log (data.thumbnail)
  console.log (data.title)
  const num = randomNum()
  const card_container = document.getElementById('cards_container')
  const div_col = document.createElement('div');
  div_col.className = "col"
  div_col.innerHTML +=`
    <div class="col col_product d-flex align-items-stretch" data-product-id="${oneMovie.uid}">
      <div class="card bg-dark text-light shadow p-3 mb-5 rounded" style="width: 15rem;">
        <a href="/api/products/${data.uid}"}>
          <img src=${data.thumbnail == 'N/C'?`https://placedog.net/200/30${num}`:"./img/"+data.thumbnail[0]} class="card-img-top" alt="poster pelicula"/>
        </a>
        <div class="card-body">
          <h5 class="card-title">${data.title}</h5>
          <div class="container" data-product-id="${oneMovie.uid}">
            <button class="btn btn-danger delete_product"><i class="bi bi-trash3"></i> Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
  card_container.append(div_col)
})
