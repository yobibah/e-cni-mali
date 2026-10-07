const Majsortie = (value) => {

  if (Array.isArray(value)) {
    return value.map(Majsortie);
  }

  if (typeof value === "object" && value !== null) {
    const newObj = {};

    for (const key in value) {
      newObj[key] = Majsortie(value[key]);
    }

    return newObj;
  }

  if (typeof value === "string") {
    return value.toUpperCase();
  }

  return value;
};

module.exports = Majsortie;