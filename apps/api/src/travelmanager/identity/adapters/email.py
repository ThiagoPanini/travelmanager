"""Adapters outbound: `EmailSender` — transporte dev (log) e Resend (ADR-0004).

O envio real fica atrás do Port: sem `RESEND_API_KEY`, o composition root escolhe o
`DevEmailSender`, que **não** manda e-mail — registra o código no log (capturável
em teste) para não travar o desenvolvimento AFK. O `ResendEmailSender` faz o POST
de verdade; é ligado e validado ponta-a-ponta na fatia de go-live (#196, HITL).
"""

import json
import logging
import urllib.request

_log = logging.getLogger("travelmanager.otp")

_RESEND_ENDPOINT = "https://api.resend.com/emails"
_SUBJECT = "Seu código de embarque"


def _body(code: str) -> str:
    """Corpo (texto) do e-mail com o código OTP, em pt-BR."""
    return f"Seu código de embarque é {code}. Ele vale por 10 minutos."


class DevEmailSender:
    """Transporte de desenvolvimento: registra o código no log, sem rede."""

    def send_code(self, email: str, code: str) -> None:
        """Loga o código (nível INFO) em vez de enviar e-mail.

        Args:
            email: Destinatário.
            code: Código OTP em claro.
        """
        _log.info("OTP dev para %s: %s", email, code)


class ResendEmailSender:
    """Transporte real via API da Resend (ligado no go-live, #196)."""

    def __init__(self, api_key: str, sender: str) -> None:
        """Inicializa o transporte.

        Args:
            api_key: `RESEND_API_KEY`.
            sender: Remetente verificado (`EMAIL_FROM`).
        """
        self._api_key = api_key
        self._sender = sender

    def send_code(self, email: str, code: str) -> None:
        """Envia o código via Resend.

        Args:
            email: Destinatário.
            code: Código OTP em claro.
        """
        payload = json.dumps(
            {"from": self._sender, "to": [email], "subject": _SUBJECT, "text": _body(code)}
        ).encode()
        req = urllib.request.Request(
            _RESEND_ENDPOINT,
            data=payload,
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        urllib.request.urlopen(req).close()  # noqa: S310 — URL é constante interna
