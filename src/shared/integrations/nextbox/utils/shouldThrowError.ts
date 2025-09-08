export const shouldThrowError = (response: Response) => {
  return !response.ok && ![403, 404].includes(response.status);
};
