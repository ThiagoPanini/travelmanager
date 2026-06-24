"""Use-case `CompleteOnboarding` (ADR-0005): grava o Perfil mínimo e encerra o onboarding.

Testa a regra com **fakes dos Ports** (sem DB): o usuário-semente é uma entidade em
memória, e o `UserRepository` fake só registra a intenção de persistir. A política
("campos obrigatórios", carimbo de `onboarded_at`) é o que se exercita aqui.
"""

import pytest

from travelmanager.identity.application.use_cases import CompleteOnboarding
from travelmanager.identity.domain.models import User
from travelmanager.shared.errors import Invalid

from .conftest import FakeUserRepository, FixedClock


class TestCompleteOnboarding:
    def test_grava_perfil_e_carimba_onboarded(
        self, users: FakeUserRepository, clock: FixedClock
    ) -> None:
        # given: usuário recém-criado, ainda sem perfil
        user = User(email="viajante@example.com")
        complete = CompleteOnboarding(users, clock)
        # when: completa o onboarding com os campos mínimos
        result = complete(user, display_name="Maria", origin_city="São Paulo", country="BR")
        # then: o perfil é gravado e `onboarded_at` carimbado com o relógio
        assert result.profile is not None
        assert result.profile.display_name == "Maria"
        assert result.profile.origin_city == "São Paulo"
        assert result.profile.country == "BR"
        assert result.profile.onboarded_at == clock.now()
        # e a intenção de persistir o usuário foi registrada
        assert user in users.saved

    @pytest.mark.parametrize(
        ("display_name", "origin_city", "country"),
        [
            ("", "São Paulo", "BR"),
            ("Maria", "  ", "BR"),
            ("Maria", "São Paulo", ""),
        ],
    )
    def test_campo_em_branco_recusa(
        self,
        users: FakeUserRepository,
        clock: FixedClock,
        display_name: str,
        origin_city: str,
        country: str,
    ) -> None:
        # given: um campo obrigatório vazio (ou só espaços)
        user = User(email="viajante@example.com")
        complete = CompleteOnboarding(users, clock)
        # when/then: recusa com Invalid e não persiste nem carimba
        with pytest.raises(Invalid):
            complete(user, display_name=display_name, origin_city=origin_city, country=country)
        assert user.profile is None
        assert users.saved == []
