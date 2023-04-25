# Retry Promise

Retries a promise and returns the result when successful or throws an error when it continues to fail after the specified number of attempts.

## `retryPromise(callback[, options])`

- `callback` `<Function>` A function that returns the promise that is to be reattempted
- `options` `<Object>`
  - `onError` `<Function>` A function that will run each time the callback fails and the number of attempts is less than the `maxAttempts`. It can optionally take in the `Error` object in its firset argument and a second argument that includes the current attempt number
  - `maxAttempts` `<number>` Default: 3 Number of attempts before throwing an error
  - `timeout` `<number>` Default: 3000 Milliseconds between each attempt
- Returns: `<Promise<any>>`

Example:

```typescript
try {
  await retryPromise(makeACallToAnApi, {
    onError: (errFromCallback, { attempts }) => {
      console.error(errFromCallback);
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

## `onError(error[, options])`

- `error` `<Error>` The error thrown by the Promise returned by the callback
- `options` `<Object>`
  - `attempts` `<number>` The number of attempts that have already occured
  - `maxAttempts` `<number>` The maximum number of attempts originally passed into `retryPromise`
- Returns: `<void> | <Promise<void>>`

An optional callback function that can process logic between attempts.

Example:

```typescript
const handleLogicBetweenAttempts = (
  error,
  { attempts, maxAttempts, resolve, reject }
) => {
  if (attempts === maxAttempts) {
    console.log("Last try");
  }
  if (error.code === "ECONNABORTED") return; // continues retrying
  if (error.message === "Bad Gateway") throw error; // stops retrying, fails with that error
  if (error.code === "Unauthorized") return renewAuth(); // If returning a function that returns a promise will resolve before continuing to the next attempt
  if (error.code === "EADDRINUSE") reject(error); // same as throwing an error with `throw` keyword
  if (error.code === "ENOTFOUND") {
    return axios.post("/back-upURL").then((res) => resolve(res)); // tries different promise and resolves `retryPromise` immediately with that result
  }
};

try {
  await retryPromise(makeACallToAnApi, {
    onError: handleLogicBetweenAttempts,
    maxAttempts: 5,
    timeout: 100,
  });
} catch (err) {
  console.error(err);
}
```
