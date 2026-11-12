import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage.jsx";

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ login: loginMock }),
}));

vi.mock("../i18n/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key) => key }),
}));

function CurrentPath() {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
}

const renderLoginPage = () =>
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <LoginPage />
      <CurrentPath />
    </MemoryRouter>
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginPage", () => {
  it("muestra errores y no intenta iniciar sesión con datos vacíos", async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByRole("button", { name: "auth.login.submit" }));

    expect(screen.getByLabelText(/auth.login.email/)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByLabelText(/auth.login.password/)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("inicia sesión y lleva al panel correspondiente al perfil", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({ rol: "Comprador" });
    renderLoginPage();

    await user.type(
      screen.getByLabelText(/auth.login.email/),
      "comprador@example.com"
    );
    await user.type(
      screen.getByLabelText(/auth.login.password/),
      "clave-segura"
    );
    await user.click(screen.getByRole("button", { name: "auth.login.submit" }));

    expect(loginMock).toHaveBeenCalledWith(
      "comprador@example.com",
      "clave-segura"
    );
    await waitFor(() => {
      expect(screen.getByTestId("current-path")).toHaveTextContent(
        "/comprador"
      );
    });
  });
});
