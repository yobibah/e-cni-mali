

const getRefreshToken = () => {
  try {
    const token = localStorage.getItem("refreshtoken");

    if (!token) {
      return false;
    }
    // console.log(token)
    return token;

  } catch (err) {
    console.log(err);
    return false;
  }
};

export default getRefreshToken;