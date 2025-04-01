///|
enum Message {}


 ///|
///|
pub fn app() -> @html.Html[Message] {
  let count = 1
  @html.node("p", [], [@html.text("You clicked"), @html.text(count.to_string())])
}
