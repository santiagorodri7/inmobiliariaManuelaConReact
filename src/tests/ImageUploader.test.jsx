import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImageUploader from "../components/property/ImageUploader.jsx";

// ---------- MOCKS (simulaciones de lo que el componente importa) ----------
// vi.hoisted crea las funciones espía ANTES de que vi.mock se ejecute
// (vi.mock sube al inicio del archivo, por eso no puede ver variables normales).
const { toastMock, validateImageFileMock } = vi.hoisted(() => ({
  toastMock: { error: vi.fn(), info: vi.fn() },
  validateImageFileMock: vi.fn(),
}));

// Los paths son relativos a ESTE archivo (src/tests), no al componente.
vi.mock("../components/ui/Toast.jsx", () => ({ useToast: () => toastMock }));

// t() devuelve la clave tal cual: así los tests no dependen del idioma ni del texto exacto.
vi.mock("../i18n/I18nContext.jsx", () => ({ useI18n: () => ({ t: (key) => key }) }));

// Evita cargar Firebase. Devolver "" (falsy) significa "archivo válido".
vi.mock("../services/storageService.js", () => ({ validateImageFile: validateImageFileMock }));

// ---------- AYUDAS ----------
const crearArchivo = (nombre = "foto.png", tipo = "image/png") =>
  new File(["contenido"], nombre, { type: tipo });

const crearImagenes = (cantidad) =>
  Array.from({ length: cantidad }, (_, i) => ({ url: `https://ejemplo.com/${i}.jpg` }));

const getInput = (container) => container.querySelector('input[type="file"]');

// Se ejecuta antes de CADA test, para partir siempre del mismo estado
beforeEach(() => {
  vi.clearAllMocks();                        // borra el historial de llamadas
  validateImageFileMock.mockReturnValue(""); // por defecto, todo archivo es válido
  URL.createObjectURL = vi.fn(() => "blob:url-falsa"); // jsdom no los trae
  URL.revokeObjectURL = vi.fn();
});

// ---------- TESTS ----------
describe("ImageUploader", () => {
  it("muestra la zona de carga y el botón para elegir imágenes", () => {
    render(<ImageUploader onFilesChange={vi.fn()} />);

    expect(screen.getByText("property.uploader.drag")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "property.uploader.choose" })).toBeEnabled();
  });

  it("avisa con onFilesChange cuando se elige un archivo válido", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const { container } = render(<ImageUploader onFilesChange={onFilesChange} />);
    const archivo = crearArchivo();

    await user.upload(getInput(container), archivo); // simula elegir el archivo

    expect(onFilesChange).toHaveBeenCalledWith([archivo]);
  });

  it("rechaza un archivo inválido y muestra un error", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    validateImageFileMock.mockReturnValueOnce("Formato no permitido"); // solo para esta llamada
    const { container } = render(<ImageUploader onFilesChange={onFilesChange} />);

    await user.upload(getInput(container), crearArchivo("foto.png"));

    expect(toastMock.error).toHaveBeenCalledWith("foto.png: Formato no permitido");
    expect(onFilesChange).not.toHaveBeenCalled(); // no debe avisar al padre
  });

  it("rechaza un archivo de más de 8 MB", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const { container } = render(<ImageUploader onFilesChange={onFilesChange} />);
    const grande = crearArchivo("grande.png");
    // Fingimos el tamaño sin crear 9 MB reales en memoria
    Object.defineProperty(grande, "size", { value: 9 * 1024 * 1024 });

    await user.upload(getInput(container), grande);

    expect(toastMock.error).toHaveBeenCalledWith("property.uploader.sizeError");
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it("respeta el máximo de 8 imágenes", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    // Ya hay 7: solo cabe 1 más
    const { container } = render(
      <ImageUploader existingImages={crearImagenes(7)} onFilesChange={onFilesChange} />
    );
    const [a, b, c] = [crearArchivo("a.png"), crearArchivo("b.png"), crearArchivo("c.png")];

    await user.upload(getInput(container), [a, b, c]);

    expect(onFilesChange).toHaveBeenCalledWith([a]); // solo pasa el primero
    expect(toastMock.info).toHaveBeenCalledWith("property.uploader.maxImages");
  });

  it("deshabilita el botón de elegir al llegar a 8 imágenes", () => {
    render(<ImageUploader existingImages={crearImagenes(8)} onFilesChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "property.uploader.choose" })).toBeDisabled();
  });

  it("permite quitar una imagen existente", async () => {
    const user = userEvent.setup();
    const onRemoveExisting = vi.fn();
    const imagenes = crearImagenes(2);
    render(
      <ImageUploader
        existingImages={imagenes}
        onRemoveExisting={onRemoveExisting}
        onFilesChange={vi.fn()}
      />
    );

    // Hay un botón de quitar por cada imagen: getAllByRole devuelve una lista
    const botones = screen.getAllByRole("button", { name: "property.uploader.removeExisting" });
    await user.click(botones[1]); // clic en el de la segunda imagen

    expect(onRemoveExisting).toHaveBeenCalledWith(imagenes[1], 1);
  });

  it("permite quitar un archivo nuevo de la lista", async () => {
    const user = userEvent.setup();
    const onFilesChange = vi.fn();
    const [a, b] = [crearArchivo("a.png"), crearArchivo("b.png")];
    render(<ImageUploader newFiles={[a, b]} onFilesChange={onFilesChange} />);

    expect(screen.getByText("a.png")).toBeInTheDocument(); // se ven los nombres

    const botones = screen.getAllByRole("button", { name: "property.uploader.remove" });
    await user.click(botones[0]); // quita "a.png"

    expect(onFilesChange).toHaveBeenCalledWith([b]); // queda solo b
  });

  it("muestra la barra de progreso solo mientras sube", () => {
    const { rerender } = render(<ImageUploader progress={40} onFilesChange={vi.fn()} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");

    // rerender vuelve a dibujar el mismo componente con otros props
    rerender(<ImageUploader progress={100} onFilesChange={vi.fn()} />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});