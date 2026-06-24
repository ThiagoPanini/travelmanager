"""Adapter outbound: `CodeGenerator` sobre `secrets` (ADR-0005).

O código OTP é não-determinístico como o token de sessão: atrás de um Port para que
os testes injetem códigos previsíveis. O adapter default sorteia 6 dígitos uniformes
em `[0, 999999]` com `secrets.randbelow` (CSPRNG) e zero-padda — `7` vira `000007`.
"""

import secrets
from collections.abc import Callable

_RANGE = 1_000_000


class SecretsCodeGenerator:
    """Adapter default: código OTP de 6 dígitos via `secrets.randbelow`."""

    def __init__(self, _rand: Callable[[int], int] = secrets.randbelow) -> None:
        """Inicializa o gerador.

        Args:
            _rand: Fonte de aleatoriedade `(n) -> [0, n)`; default `secrets.randbelow`
                (CSPRNG). Injetável só para teste.
        """
        self._rand = _rand

    def generate(self) -> str:
        """Sorteia 6 dígitos numéricos, com zeros à esquerda preservados."""
        return f"{self._rand(_RANGE):06d}"
