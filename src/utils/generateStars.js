export const generarEstrellas = (rating) => {
  let estrellas = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      estrellas += "★";
    } else {
      estrellas += "☆";
    }
  }
  return estrellas;
};
