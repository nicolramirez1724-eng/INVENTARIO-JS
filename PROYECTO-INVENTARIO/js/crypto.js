async function hashTexto(texto) {
  const datos = new TextEncoder().encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', datos);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}
