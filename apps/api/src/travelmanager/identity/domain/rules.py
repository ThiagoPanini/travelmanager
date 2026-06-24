"""Regras puras de identidade (ADR-0005): lógica sem uma linha de banco.

Sessão e OTP guardam o **segredo como HMAC**, nunca em claro: `HMAC-SHA256(segredo,
pepper)` em hex é o que de fato se persiste (ADR-0004) — em `AuthSession.token_hash`
e em `OtpCode.code_hash`. Sem fallback de pepper aqui: cada pepper é injetado a
partir do composition root (`adapters/dependencies.py`); o domínio não conhece
configuração nem ambiente.
"""

import hashlib
import hmac


def _hmac_hex(secret: str, pepper: str) -> str:
    """HMAC-SHA256 do segredo sob o pepper, em hexadecimal."""
    return hmac.new(pepper.encode(), secret.encode(), hashlib.sha256).hexdigest()


def normalize_email(email: str) -> str:
    """Normaliza o e-mail para a forma canônica da chave natural.

    E-mail é a chave natural da identidade (ADR-0004): OTP e Google têm de cair no
    mesmo `Usuário`. A canonicalização (sem espaços, caixa-baixa) é regra de
    domínio para que `Maria@X.com ` e `maria@x.com` sejam a mesma pessoa.

    Args:
        email: E-mail como digitado.

    Returns:
        O e-mail aparado e em caixa-baixa.
    """
    return email.strip().lower()


def hash_session_token(token: str, pepper: str) -> str:
    """Calcula o HMAC-SHA256 do token de sessão.

    Args:
        token: Token opaco em claro (o segredo que viaja no cookie/Bearer).
        pepper: Chave HMAC do servidor.

    Returns:
        O digest em hexadecimal — o valor persistido em `AuthSession.token_hash`.
    """
    return _hmac_hex(token, pepper)


def hash_otp_code(code: str, pepper: str) -> str:
    """Calcula o HMAC-SHA256 do código OTP.

    O código de 6 dígitos nunca toca o banco em claro: só o digest é persistido,
    e a verificação compara hashes (ADR-0004).

    Args:
        code: Código OTP em claro (os 6 dígitos enviados ao usuário).
        pepper: Chave HMAC do servidor (distinta do pepper de sessão).

    Returns:
        O digest em hexadecimal — o valor persistido em `OtpCode.code_hash`.
    """
    return _hmac_hex(code, pepper)
