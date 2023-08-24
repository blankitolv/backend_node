
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
    return this
  }

  notFound(msg="Not found"){
    this.msg = msg
    this.status = "404"
    this.content = {}
    return this
  }

  internalServerError(msg="Internal Server Error"){
    this.msg = msg
    this.status = "500"
    this.content = {}
    return this
  }

  ok(obj){
    this.msg = "ok"
    this.status = "200"
    this.content = obj
    return this
  }

  teaPot(msg="418 I'm a teapot"){
    this.msg = msg
    this.status = "418"
    this.content = {}
    return this
  }
}

module.exports = Response;