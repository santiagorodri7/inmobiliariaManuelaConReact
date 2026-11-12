import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import TestimonialForm from "../components/testimonials/TestimonialForm.jsx";

const { toastMock, createTestimonialMock } = vi.hoisted(() => ({
  toastMock: { error: vi.fn(), success: vi.fn() },
  createTestimonialMock: vi.fn(),
}));

vi.mock("../components/ui/Toast.jsx", () => ({ useToast: () => toastMock }));

vi.mock("../i18n/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key, values) =>
      key === "testimonials.stars.star"
        ? `${key} ${values.star}`
        : key,
  }),
}));

vi.mock("../services/testimonialsService.js", () => ({
  createTestimonial: createTestimonialMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TestimonialForm", () => {
  it("invita al visitante sin cuenta a iniciar sesión", () => {
    render(
      <MemoryRouter>
        <TestimonialForm />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "testimonials.form.guestTitle" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "testimonials.form.guestLogin" })
    ).toHaveAttribute("href", "/login");
  });

  it("no publica un testimonio incompleto", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TestimonialForm profile={{ nombre: "Ana" }} onCreated={vi.fn()} />
      </MemoryRouter>
    );

    await user.click(
      screen.getByRole("button", { name: "testimonials.form.submit" })
    );

    expect(toastMock.error).toHaveBeenCalledWith(
      "testimonials.form.validationToast"
    );
    expect(createTestimonialMock).not.toHaveBeenCalled();
  });

  it("publica un testimonio válido y avisa al componente que lo creó", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();
    const created = { id: "testimonio-1", nombre: "Ana" };
    createTestimonialMock.mockResolvedValue(created);
    render(
      <MemoryRouter>
        <TestimonialForm
          profile={{ nombre: "Ana" }}
          onCreated={onCreated}
        />
      </MemoryRouter>
    );

    await user.click(
      screen.getByRole("radio", { name: "testimonials.stars.star 5" })
    );
    await user.type(
      screen.getByLabelText("testimonials.form.profession"),
      "Agente inmobiliaria"
    );
    await user.type(
      screen.getByPlaceholderText("testimonials.form.textPlaceholder"),
      "La atención fue excelente y encontré el hogar que buscaba."
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(
      screen.getByRole("button", { name: "testimonials.form.submit" })
    );

    expect(createTestimonialMock).toHaveBeenCalledWith({
      nombre: "Ana",
      profesion: "Agente inmobiliaria",
      texto: "La atención fue excelente y encontré el hogar que buscaba.",
      rating: 5,
      acepta: true,
    });
    expect(onCreated).toHaveBeenCalledWith(created);
    expect(toastMock.success).toHaveBeenCalledWith(
      "testimonials.form.successToast"
    );
  });
});
