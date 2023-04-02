import { readPromise } from "./read-promise";
import { memoize } from "lodash-es";

type AsyncFunc = (...args: any[]) => Promise<any>;

export function createLoader <T extends AsyncFunc> (func: T) {
  const memoized = memoize (func)
  return (...args: Parameters <T>) => {
    const res = readPromise (memoized (...args)) 
    return res as Awaited <ReturnType <T>>
  }
}
