const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { getBytes, ref, uploadBytes } = require("firebase/storage");

const rules = fs.readFileSync(
  path.join(__dirname, "..", "storage.rules"),
  "utf8",
);

const results = [];
const check = async (name, promise, shouldPass) => {
  try {
    await (shouldPass ? assertSucceeds(promise) : assertFails(promise));
    results.push(`PASS ${name}`);
  } catch (error) {
    results.push(`FAIL ${name} :: ${error.message}`);
  }
};

const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const png = { contentType: "image/png" };

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: "demo-manuela",
    storage: { rules, host: "127.0.0.1", port: 9199 },
  });

  const anon = testEnv.unauthenticatedContext();
  const seller = testEnv.authenticatedContext("seller1");
  const other = testEnv.authenticatedContext("seller2");

  const anonStorage = anon.storage();
  const sellerStorage = seller.storage();
  const otherStorage = other.storage();

  await check(
    "anon NO sube imágenes de propiedades",
    uploadBytes(
      ref(anonStorage, "propiedades/seller1/prop1/foto.png"),
      bytes,
      png,
    ),
    false,
  );
  await check(
    "vendedor sube imagen a su ruta",
    uploadBytes(
      ref(sellerStorage, "propiedades/seller1/prop1/foto.png"),
      bytes,
      png,
    ),
    true,
  );
  await check(
    "vendedor NO sube a la ruta de otro",
    uploadBytes(
      ref(otherStorage, "propiedades/seller1/prop1/otra.png"),
      bytes,
      png,
    ),
    false,
  );
  await check(
    "vendedor NO sube archivos que no son imagen",
    uploadBytes(
      ref(sellerStorage, "propiedades/seller1/prop1/foto.pdf"),
      bytes,
      { contentType: "application/pdf" },
    ),
    false,
  );
  await check(
    "anon lee una imagen pública",
    getBytes(ref(anonStorage, "propiedades/seller1/prop1/foto.png")),
    true,
  );
  await check(
    "vendedor sube su avatar",
    uploadBytes(ref(sellerStorage, "avatares/seller1/avatar.png"), bytes, png),
    true,
  );
  await check(
    "vendedor NO sube el avatar de otro",
    uploadBytes(ref(otherStorage, "avatares/seller1/avatar.png"), bytes, png),
    false,
  );
  await check(
    "anon NO sube avatares",
    uploadBytes(ref(anonStorage, "avatares/anon/avatar.png"), bytes, png),
    false,
  );

  console.log(results.join("\n"));
  console.log(
    `\n${results.filter((line) => line.startsWith("PASS")).length}/${results.length} pruebas de Storage aprobadas`,
  );
  await testEnv.cleanup();
  process.exit(results.some((line) => line.startsWith("FAIL")) ? 1 : 0);
})().catch((error) => {
  console.error("ERROR GENERAL", error);
  process.exit(1);
});
