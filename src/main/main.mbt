///|
fn main {
  let app = @vue.create(data={ "message": "Hello, MoonBit!" })
  app.mount("#app")
  app.setState({ "message": "Hello, MoonBit! 2" })
}
