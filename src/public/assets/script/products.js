let token = ""
const  verifyToken = async () =>{
  const token = JSON.parse(localStorage.getItem('notflixToken'));
  if (token){
    const headers = new Headers();
    headers.append('Authorization', 'Bearer ' + token.accessToken);
    fetch('/api/users/verifyAuth',{
      method:'POST',
      headers: headers
    })
    .then(resp => {
      if (resp.ok){
        token = token.accessToken
        console.log("mmm... te podés quedar");
      } else {
        console.log("1 NO TE podés quedar");
        window.location.href="/login";
      }
    })
    .catch(e=> {
      console.log(e);
    })
  } else {
    console.log("2 NO TE podés quedar");
    window.location.href="/login";
  }
}

document.addEventListener("DOMContentLoaded", verifyToken, true)


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