import { describe, expect, it } from "vitest";
import { findCity, searchCitiesGlobal } from "./cities";

describe("findCity", () => {
  it("resolve a cidade de origem sem exigir os mesmos acentos e restringe pelo país", async () => {
    // given: a origem textual do Perfil e seu país
    const city = "Sao Paulo";

    // when: o mapa tenta geocodificar a origem no recorte brasileiro
    const match = await findCity("BR", city);

    // then: encontra a entrada GeoNames exata dentro do país
    expect(match).toMatchObject({ name: "São Paulo" });
    expect(match?.lat).toBeTypeOf("number");
    expect(await findCity("PT", city)).toBeNull();
  });
});

describe("searchCitiesGlobal", () => {
  it("busca sem acentos e informa o país de cada cidade", async () => {
    // given: nome sem os acentos usados no índice GeoNames
    const query = "sao paulo";

    // when: busca atravessa todos os recortes de país
    const results = await searchCitiesGlobal(query);

    // then: resultado preserva cidade e carimba o país inferido
    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "São Paulo",
          country: "BR",
        }),
      ]),
    );
  });
});
