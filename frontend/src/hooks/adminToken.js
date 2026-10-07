import Cookies from 'js-cookie';

export default function getToken() {
  const token = Cookies.get('AdminToken');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      Cookies.remove('token', { path: '/' });
      return null;
    }

    return token;
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    Cookies.remove('token', { path: '/' });
    return null;
  }
}