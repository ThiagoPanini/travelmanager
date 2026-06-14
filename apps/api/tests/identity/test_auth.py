"""Testes unitários para identity.auth — JWT.

Comportamentos verificados:
  1. Token gerado com email válido pode ser verificado.
  2. Token com secret errado não é verificado.
  3. Token expirado não é verificado.
  4. Token com perfil (display_name, avatar_url) pode ser verificado e payload retornado.
"""

from traveltogether.identity.auth import (
    generate_token,
    verify_token,
)

SECRET = "public-test-auth-secret-not-for-production"


def test_round_trip_jwt() -> None:
    token = generate_token("user@example.com", secret=SECRET)
    claims = verify_token(token, secret=SECRET)
    assert claims is not None
    assert claims["email"] == "user@example.com"


def test_wrong_secret_returns_none() -> None:
    token = generate_token("user@example.com", secret=SECRET)
    assert verify_token(token, secret="public-other-test-secret-not-for-production") is None


def test_expired_token_returns_none() -> None:
    token = generate_token("user@example.com", secret=SECRET, exp_seconds=-1)
    assert verify_token(token, secret=SECRET) is None


def test_verify_token_returns_claims_with_profile() -> None:
    token = generate_token(
        "alice@example.com",
        secret=SECRET,
        display_name="Alice",
        avatar_url="https://cdn/a.png",
    )
    claims = verify_token(token, secret=SECRET)
    assert isinstance(claims, dict)
    assert claims["email"] == "alice@example.com"
    assert claims["display_name"] == "Alice"
    assert claims["avatar_url"] == "https://cdn/a.png"


def test_verify_token_returns_none_fields_when_absent() -> None:
    token = generate_token("bob@example.com", secret=SECRET)
    claims = verify_token(token, secret=SECRET)
    assert claims is not None
    assert claims["display_name"] is None
    assert claims["avatar_url"] is None


def test_verify_token_backward_compat_email() -> None:
    token = generate_token("carol@example.com", secret=SECRET)
    claims = verify_token(token, secret=SECRET)
    assert claims is not None
    assert claims["email"] == "carol@example.com"
