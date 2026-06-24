"""Use-case RequestOtp com fakes dos Ports (ADR-0005): gera, persiste hash, envia.

O código cru só existe no envio; o banco guarda o HMAC. `then` afirma orquestração
(persistência + transporte) sem tocar HTTP nem DB. Endurecimento (rate-limit,
anti-enum) é a fatia #194 — aqui só o happy path.
"""

from datetime import timedelta

from tests.identity.conftest import (
    FakeCodeGenerator,
    FakeEmailSender,
    FakeOtpRepository,
    FixedClock,
)
from travelmanager.identity.application.use_cases import OTP_TTL, RequestOtp
from travelmanager.identity.domain.rules import hash_otp_code


class TestRequestOtp:
    def test_persiste_so_o_hash_e_envia_o_codigo_cru(
        self,
        otps: FakeOtpRepository,
        clock: FixedClock,
        codes: FakeCodeGenerator,
        email_sender: FakeEmailSender,
    ) -> None:
        # given: gerador de código previsível e pepper de teste
        request = RequestOtp(otps, clock, codes, email_sender, pepper="otp-pepper")
        # when:
        request("viajante@example.com")
        # then: banco só com o hash; transporte recebeu o código cru
        otp = otps.saved[0]
        assert otp.code_hash == hash_otp_code(codes.generate(), "otp-pepper")
        assert otp.code_hash != codes.generate()
        assert email_sender.sent == [("viajante@example.com", codes.generate())]

    def test_expira_em_dez_minutos(
        self,
        otps: FakeOtpRepository,
        clock: FixedClock,
        codes: FakeCodeGenerator,
        email_sender: FakeEmailSender,
    ) -> None:
        # given:
        request = RequestOtp(otps, clock, codes, email_sender, pepper="otp-pepper")
        # when:
        request("viajante@example.com")
        # then: TTL de 10 minutos a partir do relógio
        assert OTP_TTL == timedelta(minutes=10)
        assert otps.saved[0].expires_at == clock.now() + OTP_TTL

    def test_normaliza_o_email(
        self,
        otps: FakeOtpRepository,
        clock: FixedClock,
        codes: FakeCodeGenerator,
        email_sender: FakeEmailSender,
    ) -> None:
        # given: e-mail com caixa-alta e espaços
        request = RequestOtp(otps, clock, codes, email_sender, pepper="otp-pepper")
        # when:
        request("  Viajante@Example.COM ")
        # then: persistido e enviado na forma canônica
        assert otps.saved[0].email == "viajante@example.com"
        assert email_sender.sent[0][0] == "viajante@example.com"
