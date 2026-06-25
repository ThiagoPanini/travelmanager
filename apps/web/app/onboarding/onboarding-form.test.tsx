import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { push, refresh, update } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  update: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));
vi.mock("next-auth/react", () => ({ useSession: () => ({ update }) }));

// Substitui searchCities para não depender de import() dinâmico em jsdom.
vi.mock("@/lib/geo/cities", () => ({
  searchCities: vi.fn(async (_country: string, query: string) => {
    const all = [
      { name: "São Paulo", asciiName: "Sao Paulo" },
      { name: "Rio de Janeiro", asciiName: "Rio de Janeiro" },
      { name: "Curitiba", asciiName: "Curitiba" },
    ];
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter((c) => c.asciiName.toLowerCase().includes(q));
  }),
}));

import { OnboardingForm } from "./onboarding-form";

async function avancarParaPasso2(nome = "Maria") {
  fireEvent.change(screen.getByLabelText(/como podemos te chamar/i), {
    target: { value: nome },
  });
  fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
  await screen.findByLabelText(/país/i);
}

async function selecionarPais(nomeLabel = "Brasil") {
  const paisInput = screen.getByLabelText(/país/i);
  fireEvent.focus(paisInput);
  fireEvent.change(paisInput, { target: { value: "Bras" } });
  const opt = await screen.findByRole("option", { name: nomeLabel });
  fireEvent.mouseDown(opt);
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200 })));
});

afterEach(() => {
  vi.unstubAllGlobals();
  push.mockReset();
  refresh.mockReset();
  update.mockReset();
});

describe("OnboardingForm (wizard de 2 passos)", () => {
  it("passo 1 mostra campo de nome pré-preenchido e botão 'Próximo'", () => {
    render(<OnboardingForm defaultName="Maria do Google" />);
    expect(screen.getByLabelText(/como podemos te chamar/i)).toHaveValue("Maria do Google");
    expect(screen.getByRole("button", { name: /próximo/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/país/i)).not.toBeInTheDocument();
  });

  it("'Próximo' avança para o passo 2 com país e cidade", async () => {
    render(<OnboardingForm />);
    fireEvent.change(screen.getByLabelText(/como podemos te chamar/i), {
      target: { value: "Ana" },
    });
    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
    await screen.findByLabelText(/país/i);
    expect(screen.getByLabelText(/cidade de origem/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /concluir/i })).toBeInTheDocument();
  });

  it("'← Voltar' no passo 2 retorna ao passo 1", async () => {
    render(<OnboardingForm />);
    await avancarParaPasso2();
    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(screen.getByLabelText(/como podemos te chamar/i)).toBeInTheDocument();
  });

  it("passo 1: 'Próximo' desabilitado sem nome", () => {
    render(<OnboardingForm />);
    expect(screen.getByRole("button", { name: /próximo/i })).toBeDisabled();
  });

  it("cidade desabilitada até escolher país", async () => {
    render(<OnboardingForm />);
    await avancarParaPasso2();
    expect(screen.getByLabelText(/cidade de origem/i)).toBeDisabled();
  });

  it("envia perfil ao /api/profile e navega para /app", async () => {
    render(<OnboardingForm defaultName="Maria" />);
    await avancarParaPasso2("Maria");
    await selecionarPais("Brasil");

    const cidadeInput = screen.getByLabelText(/cidade de origem/i);
    fireEvent.focus(cidadeInput);
    fireEvent.change(cidadeInput, { target: { value: "sao" } });
    const spOpt = await screen.findByRole("option", { name: "São Paulo" });
    fireEvent.mouseDown(spOpt);

    fireEvent.click(screen.getByRole("button", { name: /concluir/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("/api/profile");
    expect(JSON.parse(init?.body as string)).toEqual({
      display_name: "Maria",
      origin_city: "São Paulo",
      country: "BR",
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/app"));
  });

  it("renova a sessão (needsOnboarding=false) antes de navegar", async () => {
    render(<OnboardingForm defaultName="Maria" />);
    await avancarParaPasso2("Maria");
    await selecionarPais("Brasil");

    const cidadeInput = screen.getByLabelText(/cidade de origem/i);
    fireEvent.focus(cidadeInput);
    fireEvent.change(cidadeInput, { target: { value: "sao" } });
    const spOpt = await screen.findByRole("option", { name: "São Paulo" });
    fireEvent.mouseDown(spOpt);

    fireEvent.click(screen.getByRole("button", { name: /concluir/i }));
    await waitFor(() => expect(update).toHaveBeenCalledWith({ needsOnboarding: false }));
  });

  it("escape hatch: aceita cidade livre quando não está na lista", async () => {
    render(<OnboardingForm defaultName="Ana" />);
    await avancarParaPasso2("Ana");
    await selecionarPais("Brasil");

    const cidadeInput = screen.getByLabelText(/cidade de origem/i);
    fireEvent.focus(cidadeInput);
    fireEvent.change(cidadeInput, { target: { value: "Minha Cidade Secreta" } });
    const escapeOpt = await screen.findByRole("option", {
      name: /minha cidade não está na lista/i,
    });
    fireEvent.mouseDown(escapeOpt);

    const concluir = screen.getByRole("button", { name: /concluir/i });
    expect(concluir).toBeEnabled();
    fireEvent.click(concluir);

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(body.origin_city).toBe("Minha Cidade Secreta");
  });

  it("falha do servidor mantém na tela e mostra erro", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 422 }));
    render(<OnboardingForm defaultName="Ana" />);
    await avancarParaPasso2("Ana");
    await selecionarPais("Brasil");

    const cidadeInput = screen.getByLabelText(/cidade de origem/i);
    fireEvent.focus(cidadeInput);
    fireEvent.change(cidadeInput, { target: { value: "sao" } });
    const spOpt = await screen.findByRole("option", { name: "São Paulo" });
    fireEvent.mouseDown(spOpt);

    fireEvent.click(screen.getByRole("button", { name: /concluir/i }));
    await screen.findByRole("alert");
    expect(push).not.toHaveBeenCalled();
  });
});
