export const agreeCheck = () => {
  return !!(
    localStorage.getItem("terms-of-use-agree-date") &&
    localStorage.getItem("terms-of-use-agree-date")
  );
};
