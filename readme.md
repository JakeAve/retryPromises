# Retry Promise

Retries a promise and returns the result when successful or throws an error when it continues to fail after the specified number of attempts.

## `retryPromise(callback[, options])`

- `callback` `<Function>` A function that returns the promise that is to be reattempted
- `options` `<Object>`
  - `onError` `<Function>` A function that will run each time the callback fails and the number of attempts is less than the `maxAttempts`. It can optionally take in the `Error` object in its firset argument and a second argument that includes the current attempt number
  - `maxAttempts` `<number>` Default: 3 Number of attempts before throwing an error
  - `timeout` `<number>` Default: 3000 Milliseconds between each attempt
- Returns: `<Promise<any>>`

```typescript
try {
  await retryPromise(makeACallToAnApi, {
    onError: (errFromCallback, { attempts }) => {
      console.error(err);
      if (attempts < 4) {
        console.log("retrying");
      }
    },
    maxAttempts: 5,
    timeout: 100,
  });
} catch (err) {
  console.error(err);
}
```
