# `lib/ext/profile`

Profiles module is an abstraction layer on top of the storage. The way it works is that the module stores its own state with all profiles information in a separate cell, while the remaining cells are identified with specific profile using storage key prefixes.

## Usage

The main function, `underProfile(key)`, is asynchronous and formats the requested storage key according to the current profile. Until the profiles are initialized, this method will wait.

```typescript
import { underProfile } from "lib/ext/profile";

let key = "foo";
let realKey = await underProfile(key);

storage.set(realKey, "bar");

// Real case - `lib/ext/storage.ts`

// A wrapper over web extension storage
// (`browser.storage.local`)
// Aims to profile entities only

import { StorageArea } from "./storageArea";
import { underProfile } from "./profile";

export const storage = new StorageArea("local", {
  keyMapper: underProfile,
});

await storage.fetch("foo"); // "bar"
```

And the function that needs to be executed first in the Background script. It simply initializes the module.

```typescript
import { initProfiles } from "lib/ext/profile";

initProfiles();
```
