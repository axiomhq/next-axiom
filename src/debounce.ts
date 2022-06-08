export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return async function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => await fn.apply(this, args), ms);
  };
};
