import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.157.0/testing/asserts.ts";
import { retryPromise } from "./mod.ts";

const rejectyPromise: () => Promise<void> = () =>
  new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject();
    }, 100);
  });

const acceptyPromise: () => Promise<void> = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 100);
  });

Deno.test("True promises work", async () => {
  try {
    await retryPromise(acceptyPromise, { timeout: 100 });
    assert(true);
    // deno-lint-ignore no-empty
  } catch {}
});
Deno.test("False promises eventually reject", async () => {
  try {
    await retryPromise(rejectyPromise, {
      timeout: 100,
    });
  } catch {
    assert(true);
  }
});
Deno.test("Attempt number is passed to the onError", async () => {
  const attemptNumbers: number[] = [];
  try {
    await retryPromise(rejectyPromise, {
      timeout: 100,
      onError: (_e, { attempts }) => {
        attemptNumbers.push(attempts);
      },
    });
  } catch {
    assertArrayIncludes([1, 2, 3], attemptNumbers);
  }
});
Deno.test("Attempts option works", async () => {
  const attemptNumbers: string[] = [];
  try {
    await retryPromise(rejectyPromise, {
      timeout: 100,
      onError: (_err) => {
        attemptNumbers.push("");
      },
      maxAttempts: 4,
    });
  } catch {
    assertEquals(4, attemptNumbers.length);
  }
});
Deno.test("Timeout option works", async () => {
  const attemptNumbers: string[] = [];
  const start = Date.now();
  try {
    await retryPromise(rejectyPromise, {
      timeout: 10,
      onError: () => {
        attemptNumbers.push("");
      },
    });
  } catch {
    const diff = Date.now() - start;
    assert(diff < 3000);
    assert(diff > 30);
  }
});
Deno.test("Able to abort retries", async () => {
  await assertRejects(
    () =>
      retryPromise(rejectyPromise, {
        onError: () => {
          throw new Error("foo");
        },
      }),
    Error,
    "foo"
  );
});
