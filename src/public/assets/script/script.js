const btn_products = document.getElementById('btn_products')
btn_products.addEventListener('click',async(e)=>{
  e.preventDefault();
  let response = {}
  await fetch('http://localhost:8080/api/products')
  .then(res =>res.json())
  .then(data => response = data)

  let productos = []
  if (response.status === "200") {
    if (response.content.length > 0) {
      productos = response.content
    }
  } else {
    return
  }
  console.log(productos);
  let html = "<ol>"
  let ol = document.createElement('ol')

  productos.forEach(each_item => {
    let li = document.createElement('li')
    li.innerHTML = `
    <div class="card" style="width: 18rem;">
      <div class="card-body">
        <h5 class="card-title">${each_item.title}</h5>
        <h6 class="card-subtitle mb-2 text-body-secondary">${each_item.uid} - ${each_item.price}</h6>
        <p class="card-text">${each_item.description}</p>
        <a href="#" class="card-link">editar</a>
        <a href="#" class="card-link">eliminar</a>
      </div>
    </div>
    `
    ol.appendChild(li) 
  });
  let list_productos = document.getElementById('list_productos')
  list_productos.append(ol)
})
