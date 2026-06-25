"""Vínculo de contas OTP↔Google pela chave natural (ADR-0004, #195).

As duas portas — OTP e Google — resolvem pro **mesmo** `Usuário` quando o e-mail
verificado coincide. Aqui os dois use-cases (`VerifyOtp` e `SignInWithGoogle`)
compartilham os **mesmos** repositórios fake (`users`, `identities`, `sessions`),
para que o teste afirme a *convergência* — não o comportamento de cada porta
isolada, que já vive em `test_verify_otp.py` e `test_sign_in_with_google.py`.

Sobre "1 user com 2 identities" (critério da #195): por ADR-0004 a tabela
`auth_identities` registra **só** vínculo de **provedor externo**; a porta OTP é a
própria chave natural (`users.email` + `email_verified_at`), não uma linha de
`auth_identities`. Logo o estado após OTP→Google é **1 user + 1 linha google** — as
"2 identities" são os dois *caminhos* de login que caem no mesmo usuário, não duas
linhas na tabela.
"""

from datetime import timedelta

import pytest

from tests.identity.conftest import (
    FakeGoogleVerifier,
    FakeIdentityRepository,
    FakeOtpRepository,
    FakeSessionRepository,
    FakeTokenGenerator,
    FakeUserRepository,
    FixedClock,
)
from travelmanager.identity.application.use_cases import (
    CreateSession,
    SignInWithGoogle,
    VerifyOtp,
)
from travelmanager.identity.domain.google import GoogleClaims
from travelmanager.identity.domain.models import OtpCode
from travelmanager.identity.domain.rules import hash_otp_code
from travelmanager.shared.errors import Unauthorized

_EMAIL = "viajante@example.com"
_CODE = "654321"
_OTP_PEPPER = "otp-pepper"
_SUBJECT = "google-sub-123"
_TOKEN = "id-token-valido"


def _seed_otp(otps: FakeOtpRepository, clock: FixedClock, *, email: str = _EMAIL) -> None:
    otps.save(
        OtpCode(
            email=email,
            code_hash=hash_otp_code(_CODE, _OTP_PEPPER),
            expires_at=clock.now() + timedelta(minutes=5),
        )
    )


def _build_verify(
    otps: FakeOtpRepository,
    users: FakeUserRepository,
    sessions: FakeSessionRepository,
    clock: FixedClock,
    tokens: FakeTokenGenerator,
) -> VerifyOtp:
    create = CreateSession(sessions, clock, tokens, pepper="sess-pepper")
    return VerifyOtp(otps, users, create, clock, pepper=_OTP_PEPPER)


def _build_google(
    users: FakeUserRepository,
    identities: FakeIdentityRepository,
    sessions: FakeSessionRepository,
    clock: FixedClock,
    tokens: FakeTokenGenerator,
    *,
    email: str = _EMAIL,
    subject: str = _SUBJECT,
    email_verified: bool = True,
) -> SignInWithGoogle:
    verifier = FakeGoogleVerifier(
        {_TOKEN: GoogleClaims(subject=subject, email=email, email_verified=email_verified)}
    )
    create = CreateSession(sessions, clock, tokens, pepper="sess-pepper")
    return SignInWithGoogle(verifier, users, identities, create, clock)


class TestOtpEntaoGoogle:
    def test_google_no_mesmo_email_cai_no_user_do_otp_sem_duplicar(
        self,
        otps: FakeOtpRepository,
        users: FakeUserRepository,
        identities: FakeIdentityRepository,
        sessions: FakeSessionRepository,
        clock: FixedClock,
        tokens: FakeTokenGenerator,
    ) -> None:
        # given: usuário nasceu por OTP (e-mail verificado, sem vínculo externo)
        _seed_otp(otps, clock)
        verify = _build_verify(otps, users, sessions, clock, tokens)
        otp_user, _, _ = verify(_EMAIL, _CODE)
        # when: o mesmo e-mail entra por Google (verificado)
        google = _build_google(users, identities, sessions, clock, tokens)
        google_user, _, _ = google(_TOKEN)
        # then: mesma conta; uma única linha de vínculo google; sem user duplicado
        assert google_user is otp_user
        assert len(users.saved) == 1
        assert len(identities.saved) == 1
        identity = identities.get_by_provider_subject("google", _SUBJECT)
        assert identity is not None
        assert identity.user is otp_user
        # e o segundo login cunhou uma segunda sessão (uma por entrada)
        assert len(sessions.saved) == 2


class TestGoogleEntaoOtp:
    def test_otp_no_mesmo_email_cai_no_user_do_google_sem_nova_identity(
        self,
        otps: FakeOtpRepository,
        users: FakeUserRepository,
        identities: FakeIdentityRepository,
        sessions: FakeSessionRepository,
        clock: FixedClock,
        tokens: FakeTokenGenerator,
    ) -> None:
        # given: usuário nasceu por Google (e-mail verificado, com vínculo google)
        google = _build_google(users, identities, sessions, clock, tokens)
        google_user, _, _ = google(_TOKEN)
        # when: o mesmo e-mail entra por OTP
        _seed_otp(otps, clock)
        verify = _build_verify(otps, users, sessions, clock, tokens)
        otp_user, _, _ = verify(_EMAIL, _CODE)
        # then: mesma conta; nenhum vínculo novo (OTP é a chave natural, não uma
        # linha de auth_identities); sem user duplicado
        assert otp_user is google_user
        assert len(users.saved) == 1
        assert len(identities.saved) == 1
        assert len(sessions.saved) == 2


class TestGuardAntiTakeover:
    def test_google_nao_verificado_sobre_email_existente_nao_vincula(
        self,
        otps: FakeOtpRepository,
        users: FakeUserRepository,
        identities: FakeIdentityRepository,
        sessions: FakeSessionRepository,
        clock: FixedClock,
        tokens: FakeTokenGenerator,
    ) -> None:
        # given: já existe uma conta verificada para o e-mail (nascida por OTP)
        _seed_otp(otps, clock)
        verify = _build_verify(otps, users, sessions, clock, tokens)
        otp_user, _, _ = verify(_EMAIL, _CODE)
        verified_at = otp_user.email_verified_at
        # when/then: Google atesta o MESMO e-mail, mas como NÃO verificado — recusa
        # (anti account-takeover, ADR-0004): não cunha sessão nem vincula
        google = _build_google(users, identities, sessions, clock, tokens, email_verified=False)
        with pytest.raises(Unauthorized):
            google(_TOKEN)
        assert identities.saved == []
        assert len(sessions.saved) == 1  # só a sessão do login OTP legítimo
        # e a conta existente fica intocada (sem vínculo, verificação preservada)
        assert otp_user.email_verified_at == verified_at
        assert identities.get_by_provider_subject("google", _SUBJECT) is None


class TestRelinkIdempotente:
    def test_google_repetido_apos_vinculo_reusa_a_identity(
        self,
        otps: FakeOtpRepository,
        users: FakeUserRepository,
        identities: FakeIdentityRepository,
        sessions: FakeSessionRepository,
        clock: FixedClock,
        tokens: FakeTokenGenerator,
    ) -> None:
        # given: OTP criou a conta e um primeiro Google já vinculou
        _seed_otp(otps, clock)
        otp_user, _, _ = _build_verify(otps, users, sessions, clock, tokens)(_EMAIL, _CODE)
        google = _build_google(users, identities, sessions, clock, tokens)
        google(_TOKEN)
        # when: o mesmo Google entra de novo
        repeat_user, _, _ = google(_TOKEN)
        # then: reusa o vínculo — sem segunda linha nem user duplicado
        assert repeat_user is otp_user
        assert len(users.saved) == 1
        assert len(identities.saved) == 1
