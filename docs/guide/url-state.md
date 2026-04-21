# URL State

State is stored in the URL hash. You can get and set values using the [@metapages/hash-query](https://www.npmjs.com/package/@metapages/hash-query) module:

```javascript
import {
  getHashParamsFromWindow,
  getHashParamFromWindow,
  getHashParamValueJsonFromWindow,
  setHashParamValueJsonInWindow,
  setHashParamValueBase64EncodedInWindow,
  getHashParamValueBase64DecodedFromWindow,
} from "https://cdn.jsdelivr.net/npm/@metapages/hash-query@0.9.12/+esm";

// Get JSON stored in URL
const myJsonBlob = getHashParamValueJsonFromWindow("someKey") || {};

// Update the JSON blob
myJsonBlob["someKey"] = "foobar";

// Set it back in the URL
setHashParamValueJsonInWindow("someKey", myJsonBlob);

// Delete it if needed
deleteHashParamFromWindow("someKey");
```

::: tip
This is designed for relatively small values. Large multi-megabyte JSON blobs are not yet supported.
:::
