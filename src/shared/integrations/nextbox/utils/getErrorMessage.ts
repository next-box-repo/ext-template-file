export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }
  if (error instanceof Response) {
    return error.statusText;
  }
  return String(error);
};
