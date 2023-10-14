let cardID = ""
if (localStorage.getItem('cart_id')) {
  cardID = JSON.parse(localStorage.getItem('cart_id'))
} else {
  console.log("No tiene un carrito de compras asociado...")
}

/* -------------------------------- EVENTOS CARRITO -------------------------------- */
const all_add_products = document.querySelectorAll('.add_cart_product');
all_add_products.forEach(each_add_cart_btn => {
  each_add_cart_btn.addEventListener('click', () => {
    console.log('se agregó ',each_add_cart_btn.getAttribute('data-id_product'))
  })
});