// Prefer the server's message ({ success:false, message }) over axios' generic one.
export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";
