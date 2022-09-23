interface RetryOptions {
  onError: (error: Error, { attempts }: { attempts: number }) => void;
  maxAttempts: number;
  timeout: number;
}

export const retryPromise = (
  // deno-lint-ignore no-explicit-any
  callback: () => Promise<any>,
  options: Partial<RetryOptions> = {}
) =>
  new Promise((resolve, reject) => {
    const { onError, maxAttempts = 3, timeout = 3000 } = options;
    let attempts = 1;
    const makeAttempt = () =>
      callback()
        .then((result) => resolve(result))
        .catch((err) => {
          onError?.(err, { attempts });
          attempts++;
          if (attempts > maxAttempts) reject(err);
          else setTimeout(makeAttempt, timeout);
        });

    makeAttempt();
  });
