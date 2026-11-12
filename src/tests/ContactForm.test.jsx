import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ContactForm from "../components/contact/ContactForm.jsx";

const { toastMock, sendContactMessageMock } = vi.hoisted(() => ({
  toastMock: { error: vi.fn(), success: vi.fn() },
  sendContactMessageMock: vi.fn(),
}));

vi.mock("../components/ui/Toast.jsx", () => ({ useToast: () => toastMock }));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ profile: null }),
}));

vi.mock("../i18n/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key) => key,
    contactSubjectLabel: (subject) => subject,
  }),
}));

vi.mock("../services/contactService.js", () => ({
  sendContactMessage: sendContactMessageMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const renderContactForm = (props = {}) =>
  render(
    <MemoryRouter>
      <ContactForm {...props} />
    </MemoryRouter>
  );

describe("ContactForm", () => {
  it("no envía el formulario cuando faltan datos obligatorios", async () => {
    const user = userEvent.setup();
    renderContactForm();

    await user.click(screen.getByRole("button", { name: "contactForm.submit" }));

    expect(toastMock.error).toHaveBeenCalledWith(
      "contactForm.validationToast"
    );
    expect(sendContactMessageMock).not.toHaveBeenCalled();
  });

  it("envía los datos válidos y muestra la confirmación", async () => {
    const user = userEvent.setup();
    const onSent = vi.fn();
    renderContactForm({ propertyId: "prop-42", onSent });

    await user.type(
      screen.getByLabelText(/contactForm.name/),
      "María López"
    );
    await user.type(
      screen.getByLabelText(/contactForm.email/),
      "maria@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("contactForm.messagePlaceholder"),
      "Quisiera conocer más detalles sobre esta propiedad."
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "contactForm.submit" }));

    expect(sendContactMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "María López",
        email: "maria@example.com",
        propertyId: "prop-42",
        message: "Quisiera conocer más detalles sobre esta propiedad.",
        acepta: true,
      })
    );
    expect(onSent).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("heading", { name: "contactForm.sentTitle" })
    ).toBeInTheDocument();
    expect(toastMock.success).toHaveBeenCalledWith(
      "contactForm.successToast"
    );
  });
});
