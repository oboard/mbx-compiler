# oboard/mbx-compiler


## Clone
```bash
git clone --recursive https://github.com/oboard/mbx-compiler
```

## Example
### Source File
```moonbit
///|
enum AnotherMessage {}

///|
pub fn another_app() -> @html.Html[AnotherMessage] {
    let count = 5
    let the_section = <section x="{literal\"}" y={ count.to_string() } />
    let compare_result = count < 0 || count > 42
    let part = <container>
        <article data={ count.to_string() }>
            Hello { if compare_result { "Moon" } else { "Bit" } }
            language{" "}
            <span />
        </article>
        { compare_result.to_string() }
        <article />
        Here are some words...
    </container>
    let _ = false
    part
}
```

### Run
```bash
ts-node main.ts
```

### Result

```moonbit
///|
enum AnotherMessage {}


///|
pub fn another_app() -> @html.Html[AnotherMessage] {
  let count = 5
  let the_section = @html.node(
    "section",
    [
      @html.attribute("x", "{literal\"}"),
      @html.attribute("y", count.to_string()),
    ],
    [],
  )
  let compare_result = count < 0 || count > 42
  let part = @html.node("container", [], [
    @html.node("article", [@html.attribute("data", count.to_string())], [
      @html.text("Hello"),
      @html.text(if compare_result { "Moon" } else { "Bit" }),
      @html.text("language"),
      @html.text(" "),
      @html.node("span", [], []),
    ]),
    @html.text(compare_result.to_string()),
    @html.node("article", [], []),
    @html.text("Here are some words..."),
  ])
  let _ = false
  part
}
```
