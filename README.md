# oboard/mbx-compiler


```moonbit
///|
enum Message {
}

///|
pub fn app() -> @html.Html[Message] {
    let count = 1
    <p>You clicked { count.to_string() } times</p>
}
```

````bash
ts-node main.ts
```

```moonbit
///|
enum Message {}


 ///|
///|
pub fn app() -> @html.Html[Message] {
  let count = 1
  @html.node("p", [], [@html.text("You clicked"), @html.text(count.to_string())])
}

```