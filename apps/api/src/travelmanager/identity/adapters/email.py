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
# A API do Resend fica atrás do Cloudflare, que barra o User-Agent default do urllib
# (`Python-urllib/X.Y`) com 403 (error 1010). Um UA próprio passa — sem isto o envio
# real falhava em produção (#196).
_USER_AGENT = "travelmanager-api"
# Teto para a chamada de rede não pendurar o thread do request indefinidamente.
_TIMEOUT_SECONDS = 10

# Noturno — cores hardcoded para e-mail (tokens CSS não funcionam em clientes de e-mail).
_C_BG = "#0f171e"
_C_SURFACE = "#1a2530"
_C_BORDER = "#2b3945"
_C_TEXT_BRIGHT = "#f4ecda"
_C_TEXT_BODY = "#e9e1cf"
_C_TEXT_MUTED = "#9aa7b1"
_C_ACCENT = "#df6a4d"
_C_ON_ACCENT = "#14202b"


def _text(code: str) -> str:
    """Fallback em texto-puro para clientes sem HTML."""
    return (
        f"Cartão de embarque\n\n"
        f"Seu código: {code}\n\n"
        f"Válido por 10 minutos. Não compartilhe este código.\n\n"
        f"travel·manager"
    )


def _td_perf() -> str:
    """Linha de borda picotada de ticket (semicírculos laterais + linha tracejada)."""
    half = f"background-color:{_C_BG};border-radius:50%;height:20px;"
    dash = f"border-top:2px dashed {_C_BORDER};height:1px;"
    return (
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">'
        "<tr>"
        f'<td width="20" style="{half}"></td>'
        f'<td style="{dash}"></td>'
        f'<td width="20" style="{half}"></td>'
        "</tr>"
        "</table>"
    )


def _html(code: str) -> str:
    """Template HTML do cartão de embarque, identidade Noturno.

    Craft de e-mail: tabela + estilos inline + cores hardcoded + color-scheme.
    Sem imagens — ornamentos e código são texto/CSS puro.
    """
    body_style = (
        f"margin:0;padding:0;background-color:{_C_BG};color:{_C_TEXT_BODY};"
        "font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;"
    )
    outer_style = f"background-color:{_C_BG};min-height:100vh;"
    card_style = (
        f"background-color:{_C_SURFACE};border:1px solid {_C_BORDER};"
        "border-radius:12px;padding:36px 32px;"
    )
    brand_style = (
        "font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;"
        f"letter-spacing:0.15em;text-transform:uppercase;color:{_C_ACCENT};"
    )
    eyebrow_style = (
        "font-family:'Courier New',Courier,monospace;font-size:10px;"
        f"letter-spacing:0.18em;text-transform:uppercase;color:{_C_ACCENT};"
    )
    title_style = (
        f"font-family:Arial,Helvetica,sans-serif;font-size:22px;"
        f"font-weight:700;color:{_C_TEXT_BRIGHT};"
    )
    sub_style = f"font-family:Arial,Helvetica,sans-serif;font-size:13px;color:{_C_TEXT_MUTED};"
    code_style = (
        "font-family:'Courier New',Courier,monospace;font-size:42px;"
        f"font-weight:700;letter-spacing:0.18em;color:{_C_ACCENT};"
    )
    validity_style = (
        "font-family:'Courier New',Courier,monospace;font-size:11px;"
        f"letter-spacing:0.08em;color:{_C_TEXT_MUTED};"
    )
    footer_style = f"font-family:Arial,Helvetica,sans-serif;font-size:11px;color:{_C_TEXT_MUTED};"

    parts = [
        "<!DOCTYPE html>",
        '<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml">',
        "<head>",
        '  <meta charset="UTF-8" />',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        '  <meta name="color-scheme" content="dark light" />',
        '  <meta name="supported-color-schemes" content="dark light" />',
        f"  <title>{_SUBJECT}</title>",
        "</head>",
        f'<body style="{body_style}">',
        f'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"'
        f' style="{outer_style}">',
        '<tr><td align="center" style="padding:40px 16px;">',
        '<table role="presentation" width="100%" style="max-width:480px;"'
        ' cellpadding="0" cellspacing="0">',
        # marca
        '<tr><td align="center" style="padding:0 0 32px;">',
        f'<span style="{brand_style}">travel·manager</span>',
        "</td></tr>",
        # card
        f'<tr><td style="{card_style}">',
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">',
        # eyebrow
        '<tr><td align="center" style="padding:0 0 12px;">',
        f'<span style="{eyebrow_style}">✶ cartão de embarque</span>',
        "</td></tr>",
        # título
        '<tr><td align="center" style="padding:0 0 8px;">',
        f'<span style="{title_style}">Seu código chegou</span>',
        "</td></tr>",
        # subtítulo
        '<tr><td align="center" style="padding:0 0 28px;">',
        f'<span style="{sub_style}">Use o código abaixo para entrar no travel\xb7manager</span>',
        "</td></tr>",
        # picotada superior
        f'<tr><td style="padding:0 0 4px;">{_td_perf()}</td></tr>',
        # código hero
        '<tr><td align="center" style="padding:20px 0;">',
        f'<span style="{code_style}">{code}</span>',
        "</td></tr>",
        # picotada inferior
        f'<tr><td style="padding:0 0 20px;">{_td_perf()}</td></tr>',
        # validade
        '<tr><td align="center" style="padding:0 0 4px;">',
        f'<span style="{validity_style}">válido por 10 minutos \xb7 não compartilhe</span>',
        "</td></tr>",
        "</table>",
        "</td></tr>",
        # rodapé
        '<tr><td align="center" style="padding:28px 0 0;">',
        f'<span style="{footer_style}">'
        "Se você não solicitou este código, ignore este e-mail."
        "</span>",
        "</td></tr>",
        "</table>",
        "</td></tr>",
        "</table>",
        "</body>",
        "</html>",
    ]
    return "\n".join(parts)


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
        """Envia o código via Resend com template HTML de cartão de embarque.

        Args:
            email: Destinatário.
            code: Código OTP em claro.
        """
        payload = json.dumps(
            {
                "from": self._sender,
                "to": [email],
                "subject": _SUBJECT,
                "html": _html(code),
                "text": _text(code),
            }
        ).encode()
        req = urllib.request.Request(
            _RESEND_ENDPOINT,
            data=payload,
            headers={
                "Authorization": f"Bearer {self._api_key}",
                "Content-Type": "application/json",
                "User-Agent": _USER_AGENT,
            },
            method="POST",
        )
        urllib.request.urlopen(req, timeout=_TIMEOUT_SECONDS).close()  # noqa: S310 — URL é constante interna
