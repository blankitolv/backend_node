const socket = io();
let user = {};

const tiempo = () => {
  const fechaActual = new Date();
  const horaActual = fechaActual.getHours();
  const minutosActuales = fechaActual.getMinutes();
  const segundosActuales = fechaActual.getSeconds();
  return `${horaActual}:${minutosActuales}:${segundosActuales}`;
};
const expresion_email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;


const popup_email = async() => {
  const { value: email } = await Swal.fire({
    title: 'Ingrese su email',
    input: 'email',
    inputLabel: 'Your email address',
    inputPlaceholder: 'Enter your email address'
  })
  
  if (email) {
    user_email = email;
    // Swal.fire(`Entered email: ${email}`)
  }
}

const user_email_btn = document.getElementById("user_email_btn");
user_email_btn.addEventListener("click", async() => {
  // console.log(e);
  await popup_email();
  // user_email = document.getElementById("user_email").value.trim();
  if (user_email == "") {
    return;
  }
  socket.emit("signin", user_email);
  console.log(user_email);
});

socket.on("logued", async (data) => {
  try {
    const response = JSON.parse(data);
    console.log(response);
    if (response.status !== "success") {
      return;
    }
    user = response.user;
    socket.emit("all_messages", {});

    let userId = document.getElementById("user");
    document.getElementById("title").innerHTML = user.username;
    // userId.setAttribute('hidden', 'true');
    userId.classList.add("animate__bounceOut");
    setTimeout(() => {
      userId.setAttribute("hidden", "true");
      document
        .getElementById("message_box")
        .classList.remove("visually-hidden");
      document.getElementById("message_box").classList.add("animate__fadeIn");
    }, 1000);
    const send_msg = document.getElementById("send_msg");
    send_msg.addEventListener("click", (e) => {
      e.preventDefault();
      const mensaje = document.getElementById("text_msg").value.trim();
      if (mensaje == "") {
        return;
      }
      document.getElementById("text_msg").value = "";
      socket.emit("new_messagev2", mensaje);
    });
  } catch (error) {
    console.error("Error al analizar JSON:", error);
  }
});
socket.on("new_message_recibed", (data) => {
  console.log("servidor envio mensaje nuevo un usuario ", tiempo());
  const new_message = JSON.parse(data);
  inserta_mensage([new_message]);
});
socket.on("historic_room_message", (data) => {
  const all_messages = JSON.parse(data);
  inserta_mensage(all_messages);
});

const gotoend = () => {
  const box_chat = document.getElementById("box_messages_chat");
  const ultimo = box_chat.lastElementChild;
  ultimo.scrollIntoView({ behavior: "smooth" });
};

const inserta_mensage = (all_messages) => {
  all_messages.forEach((element) => {
    let user_message = "";
    let bgcolor = "";
    if (element.username === user.username) {
      alineacion = "text-end ps-2";
      user_message = "yo";
    } else {
      alineacion = "text-start";
      user_message = element.username;
    }

    let table_row = document.createElement("tr");
    table_row.classList.add("animate__animated");
    table_row.classList.add("animate__fadeIn");
    table_row.classList.add("border");
    table_row.classList.add("rounded");
    table_row.innerHTML = `
    <td class="fs-6 text-wrap" style="width: 10%;"> ${user_message}</td>
    <td class="${alineacion} text-wrap fs-5"> ${element.message}<td>
    <td class="text-end fw-lighter font-monospace fs-6" style="width: 5%;"> ${element.timestamp} </td>
  `;
    const box_chat = document.getElementById("box_messages_chat").appendChild(table_row);
    gotoend();
  });
};

const chat_notification = (message, icon) => {
  let table_row = document.createElement("tr");
  table_row.innerHTML = `
  <td colspan="4" class="text-center text-primary fw-light fs-6"> ${message} ${icon} </td>
  `;
  document.getElementById("box_messages_chat").appendChild(table_row);
  gotoend();
};

socket.on("userLogged", (data) => {
  if (user.username == undefined) {
    return;
  }
  const userConnected = JSON.parse(data);
  chat_notification(`se unió al chat ${userConnected.data}`, "🙋🏼");
});

socket.on("userDisconnected", (data) => {
  if (user.username == undefined) {
    return;
  }
  chat_notification(`se desconectó del chat ${data.username}`, "🤷🏼");
});
