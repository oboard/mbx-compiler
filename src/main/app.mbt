///|
fn app() -> Component {
  let message = "Hello World"
  render(tag="div", children=[
    render(tag="div", props={ "id": "container", "style": "width:500px" }, children=[
      render(
        tag="div",
        props={ "id": "header", "style": "background-color:#FFA500;" },
        children=[render(tag="p", children=[render(text=message)])],
      ),
    ]),
  ])
}
