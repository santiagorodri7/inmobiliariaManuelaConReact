import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertyFilters from "../components/property/PropertyFilters.jsx";

vi.mock("../i18n/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key) => key,
    operationLabel: (operation) => operation,
    propertyTypeLabel: (type) => type,
  }),
}));

const renderFilters = (overrides = {}) =>
  render(
    <PropertyFilters
      values={{
        operation: "",
        location: "",
        type: "",
        bedrooms: "",
        maxPrice: "",
      }}
      onChange={vi.fn()}
      onSubmit={vi.fn()}
      onReset={vi.fn()}
      {...overrides}
    />
  );

describe("PropertyFilters", () => {
  it("comunica la operación y el tipo de inmueble elegidos", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderFilters({ onChange });

    await user.click(screen.getByRole("button", { name: "venta" }));
    expect(onChange).toHaveBeenLastCalledWith("operation", "venta");

    await user.selectOptions(
      screen.getByRole("combobox", {
        name: "property.filters.typeAria",
      }),
      "casa"
    );
    expect(onChange).toHaveBeenLastCalledWith("type", "casa");
  });

  it("aplica los filtros al enviar el formulario", async () => {
    const onSubmit = vi.fn();
    renderFilters({ onSubmit });

    fireEvent.submit(screen.getByRole("search"));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("permite limpiar los filtros cuando se muestra esa opción", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    renderFilters({ onReset, showReset: true });

    await user.click(
      screen.getByRole("button", {
        name: "property.filters.clearAria",
      })
    );

    expect(onReset).toHaveBeenCalledOnce();
  });
});
