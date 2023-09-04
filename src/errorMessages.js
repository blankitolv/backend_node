class Response {
  constructor() {
    this.msg = ""
    this.status = 0
    this.content
  }
  
  badRequest(msg="Bad request"){
    this.msg = msg
    this.status = "400"
    this.content = {}
    console.log ("BAD REQUEST\n")
    return this
  }
  
  notFound(msg="Not found"){
    this.msg = msg
    this.status = "404"
    this.content = {}
    console.log ("NOT FOUND\n")
    return this
  }
  
  internalServerError(msg="Internal Server Error"){
    this.msg = msg
    this.status = "500"
    this.content = {}
    console.log ("response: INTERNAL SERVER ERROR\n")
    return this
  }
  
  ok(obj){
    this.msg = "ok"
    this.status = "200"
    this.content = obj
    console.log ("response: OK\n")
    return this
  }

  teaPot(msg="418 I'm a teapot"){
    this.msg = msg
    this.status = "418"
    this.content = {}
    console.log ("response: I'm a teapot\n")
    return this
  }

  // Maneja la respuesta al front.
  // Envia estado, y mensaje personalizado
  handler_message(res, response){
    if (response.badRequest) {
      res.status(400).send(this.badRequest(response.badRequest))
      return { continue: false, content:"" }
    } else if (response.error) {
      res.status(500).send(this.internalServerError(response.error))
      return { continue: false, content:"" }
    } else {
      return { continue: true, content:response }
    }
  }
}

export default Response
