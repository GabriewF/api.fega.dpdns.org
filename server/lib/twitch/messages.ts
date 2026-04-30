export const messages = {
  authRequired: (uri: string, code: string) =>
    `Autenticação necessária. Acesse ${uri} e insira o código: ${code}`,
  authPending: (uri: string, code: string) =>
    `Autenticação pendente. Acesse ${uri} e insira o código: ${code}`,
  createdClip: (uri: string) => `Clipe criado! ${uri}`,

  authError: "Erro ao iniciar autenticação. Tente novamente.",
  clipNoData: "Clipe criado mas sem resposta da Twitch. Tente novamente.",
  clipInternal: "Erro interno ao criar o clipe. Tente novamente.",
} as const;
