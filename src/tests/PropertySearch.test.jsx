import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import PropertyFilters from "../components/property/PropertyFilters.jsx";

vi.mock("../i18n/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key) => key,
    operationLabel: (operation) => operation,
    propertyTypeLabel: (type) => type,
  }),
}));

function PropertySearchHarness({ onChange }) {
  const [values, setValues] = useState({
    operation: "",
    location: "",
    type: "",
    bedrooms: "",
    maxPrice: "",
  });

  const update = (field, value) => {
    onChange(field, value);
    setValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <PropertyFilters
      values={values}
      onChange={update}
      onSubmit={vi.fn()}
      onReset={vi.fn()}
    />
  );
}

describe("Búsqueda de propiedades", () => {
  it("comunica la ubicación escrita", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PropertySearchHarness onChange={onChange} />);

    await user.type(
      screen.getByRole("searchbox", {
        name: "property.filters.locationAria",
      }),
      "Medellín"
    );

    expect(onChange).toHaveBeenLastCalledWith("location", "Medellín");
  });
});
