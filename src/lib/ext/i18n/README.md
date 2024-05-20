# `lib/ext/i18n`

A wrapper over the [standard i18n API](https://developer.chrome.com/docs/extensions/reference/i18n/):

- Allows changing the language independently of the browser's default language (which the standard module does not support).
- Works with the same standard files where internationalization is stored.
- Offers the similar API as the standard one but with more features.
- React implementation.

## Usage

```typescript
import { t, replaceT } from "lib/ext/i18n";

const en = {
  helloWorld: "Hello world",
  welcomeTo: "Welcome to {{target}}",
  importantThing: "It's <b>very important</b>\n for us",
};

t("helloWorld"); // "Hello world"
t("welcomeTo", ["London"]); // "Welcome to London"
t("importantThing"); // "It's <b>very important</b>\n for us"

replaceT("The program tells you: {{helloWorld}}"); // "The program tells you: Hello world"
```

### React

```tsx
import { T, TReplace } from "lib/ext/i18n/react";

<T i18nKey="helloWorld" /> // "Hello world"
<T i18nKey="welcomeTo" values="London" /> // "Welcome to London"
<T i18nKey="importantThing" /> // <>It's <b>very important</b><br /> for us</>

<TReplace msg="The program tells you: {{helloWorld}}" /> // "The program tells you: Hello world"
```
