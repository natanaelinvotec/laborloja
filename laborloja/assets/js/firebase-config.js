// =====================================================================
//  CONFIGURAÇÃO DO FIREBASE
//  Cole aqui os dados do seu projeto (Console Firebase → Configurações
//  do projeto → Seus apps → App da Web → "Configuração do SDK").
//
//  Enquanto "apiKey" estiver vazio, o site funciona em MODO DEMONSTRAÇÃO:
//  - o site lê o conteúdo de data/conteudo.json
//  - o painel salva só no seu navegador (para testar)
// =====================================================================
export const firebaseConfig = {
  apiKey: "AIzaSyA4bg8r0MhdrsvXrUHOY-pnGoOpIGlh0iw",
  authDomain: "laborloja-b2fac.firebaseapp.com",
  projectId: "laborloja-b2fac",
  storageBucket: "laborloja-b2fac.firebasestorage.app",
  messagingSenderId: "525774421026",
  appId: "1:525774421026:web:2615e902bec223d6f81e7b"
};

export const firebaseAtivo = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

// E-mails que podem entrar no painel e alterar o site.
// (Precisa ser igual à lista em firestore.rules.)
export const emailsAdmin = ["marcelo.teruo.mts@gmail.com"];
