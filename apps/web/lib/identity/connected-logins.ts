export interface ConnectedLogin {
  id: "otp" | "google";
  label: string;
  connected: boolean;
}

/**
 * Logins conectados da conta a partir do provider do login atual.
 *
 * A sessão é JWT (sem tabela de accounts), então só se conhece a via usada
 * para entrar agora. O e-mail (OTP) é sempre um login válido da conta; o
 * Google aparece como conectado quando foi o provider desta sessão.
 */
export function connectedLogins(provider: string | undefined): ConnectedLogin[] {
  return [
    { id: "otp", label: "E-mail com código", connected: true },
    { id: "google", label: "Google", connected: provider === "google" },
  ];
}
