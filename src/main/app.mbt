///|
enum Message {}


 ///|
///|
pub fn app() -> @html.Html[Message] {
  let message = "Hello World"
  @html.node("div", [], [
    @html.node(
      "div",
      [
        @html.attribute("id", "container"),
        @html.attribute("style", "width:500px"),
      ],
      [
        @html.node(
          "div",
          [
            @html.attribute("id", "header"),
            @html.attribute("style", "background-color:#FFA500;"),
          ],
          [@html.node("p", [], [@html.text(message)])],
        ),
      ],
    ),
  ])
}
