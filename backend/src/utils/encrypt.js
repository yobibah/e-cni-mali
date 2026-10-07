function encrypt(text) {
  const iv = crypto.randomBytes(16); // Vector d'initialisation aléatoire
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  

  return iv.toString('hex') + ':' + encrypted;
}

