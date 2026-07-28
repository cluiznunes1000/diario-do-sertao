const BASE = '/diario-do-sertao';
export const routes = {
  home: BASE + '/',
  concursos: BASE + '/concursos-norte-de-minas/',
  concursos_cidade: (cidade) => BASE + '/concursos-norte-de-minas/' + cidade,
};
