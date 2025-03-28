///|
pub struct Component {
  tag : String?
  props : Json?
  children : Array[Component]?
  text : String?
}

///|
fn render(
  tag? : String,
  props? : Json,
  children? : Array[Component],
  text? : String
) -> Component {
  { tag, props, children, text }
}
