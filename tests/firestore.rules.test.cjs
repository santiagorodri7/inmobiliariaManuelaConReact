const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  setLogLevel,
  updateDoc,
  where,
} = require("firebase/firestore");

setLogLevel("silent");

const rules = fs.readFileSync(
  path.join(__dirname, "..", "firestore.rules"),
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

const canonicalProfile = (overrides = {}) => ({
  nombre: "Perfil de prueba",
  cedula: "1020304050",
  fechaNacimiento: "1995-05-12",
  email: "perfil@test.co",
  telefono: "+57 300 000 0000",
  direccion: "Medellín",
  avatar: "",
  rol: "Comprador",
  activo: true,
  estadoCivil: "soltero",
  tipoContrato: "indefinido",
  ingresosMensuales: 4500000,
  ingresosExtras: 0,
  aceptaTratamiento: true,
  fechaAceptacionTratamiento: new Date("2026-01-10T12:00:00Z"),
  fechaRegistro: new Date("2026-01-10T12:00:00Z"),
  createdAt: new Date("2026-01-10T12:00:00Z"),
  updatedAt: new Date("2026-01-10T12:00:00Z"),
  ...overrides,
});

const registrationPayload = (email, overrides = {}) => ({
  nombre: "Usuario nuevo",
  cedula: "1020304050",
  fechaNacimiento: "1998-08-21",
  email,
  telefono: "+57 300 111 2233",
  direccion: "",
  avatar: "",
  rol: "Comprador",
  activo: true,
  estadoCivil: "casado",
  tipoContrato: "fijo",
  ingresosMensuales: 3800000,
  ingresosExtras: 250000,
  aceptaTratamiento: true,
  fechaAceptacionTratamiento: serverTimestamp(),
  fechaRegistro: serverTimestamp(),
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: "demo-manuela",
    firestore: { rules, host: "127.0.0.1", port: 8080 },
  });

  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // ------------------------------------------------------------------
    // Semilla: perfiles canónicos (`users`) y heredados (`usuarios`).
    // ------------------------------------------------------------------
    await setDoc(
      doc(db, "users", "admin1"),
      canonicalProfile({
        nombre: "Admin canónico",
        email: "admin1@test.co",
        rol: "Admin",
      }),
    );
    await setDoc(
      doc(db, "users", "seller1"),
      canonicalProfile({
        nombre: "Vendedor canónico",
        email: "seller1@test.co",
        rol: "Vendedor",
      }),
    );
    await setDoc(
      doc(db, "users", "buyer1"),
      canonicalProfile({
        nombre: "Comprador canónico",
        email: "buyer1@test.co",
      }),
    );
    await setDoc(
      doc(db, "users", "inactive1"),
      canonicalProfile({
        nombre: "Inactivo canónico",
        email: "inactive1@test.co",
        rol: "Vendedor",
        activo: false,
      }),
    );

    // `admin2` solo existe en la colección heredada: prueba la detección de
    // administradores de la colección anterior.
    await setDoc(doc(db, "usuarios", "admin2"), {
      nombre: "Admin heredado",
      email: "admin2@test.co",
      rol: "Administrador",
      activo: true,
      fechaRegistro: new Date(),
    });
    await setDoc(doc(db, "usuarios", "seller2"), {
      nombre: "Vendedor heredado",
      email: "seller2@test.co",
      rol: "Vendedor",
      activo: true,
      fechaRegistro: new Date(),
    });
    // Tiene rol Admin heredado, pero su perfil canónico dice Comprador:
    // el documento canónico debe tener prioridad y no debe ser administrador.
    await setDoc(
      doc(db, "users", "both1"),
      canonicalProfile({
        nombre: "Perfil canónico",
        email: "both1@test.co",
        rol: "Comprador",
      }),
    );
    await setDoc(doc(db, "usuarios", "both1"), {
      nombre: "Perfil heredado",
      email: "both1@test.co",
      rol: "Admin",
      activo: true,
      fechaRegistro: new Date(),
    });

    const baseProperty = {
      ownerName: "Vendedor",
      ownerEmail: "seller1@test.co",
      location: "Medellín",
      price: 500000000,
      type: "Casa",
      operation: "venta",
      description: "Descripción de prueba suficientemente larga.",
      images: [],
      featured: false,
      saleId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(doc(db, "propiedades", "pub1"), {
      ...baseProperty,
      ownerId: "seller1",
      title: "Publicada uno",
      status: "disponible",
    });
    await setDoc(doc(db, "propiedades", "hidden1"), {
      ...baseProperty,
      ownerId: "seller1",
      title: "Oculta uno",
      status: "inactiva",
    });
    await setDoc(doc(db, "propiedades", "pub2"), {
      ...baseProperty,
      ownerId: "seller2",
      ownerEmail: "seller2@test.co",
      title: "Publicada dos",
      status: "disponible",
    });
    await setDoc(doc(db, "propiedades", "legacy1"), {
      ...baseProperty,
      ownerId: "seller1",
      title: "Heredada sin estado",
    });
    await setDoc(doc(db, "propiedades", "sold1"), {
      ...baseProperty,
      ownerId: "seller1",
      title: "Vendida",
      status: "vendida",
    });

    await setDoc(doc(db, "testimonios", "active1"), {
      nombre: "Cliente",
      profesion: "Diseñadora",
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "activo",
      fecha: new Date(),
    });
    await setDoc(doc(db, "testimonios", "approved1"), {
      nombre: "Cliente aprobado",
      profesion: "",
      texto: "Un testimonio aprobado que debe ser visible públicamente.",
      rating: 5,
      estado: "aprobado",
      fecha: new Date(),
    });
    await setDoc(doc(db, "testimonios", "pending1"), {
      nombre: "Pendiente",
      profesion: "",
      texto: "Este testimonio aún requiere revisión antes de publicarse.",
      rating: 5,
      estado: "pendiente",
      fecha: new Date(),
    });
    await setDoc(doc(db, "testimonios", "inactive1"), {
      nombre: "Oculto",
      texto: "Este testimonio no debe ser visible públicamente.",
      rating: 5,
      estado: "inactivo",
      fecha: new Date(),
    });
    await setDoc(doc(db, "testimonios", "legacy1"), {
      nombre: "Heredado",
      texto: "Un testimonio heredado sin estado que debe completarse.",
      rating: 5,
      userId: "buyer1",
      email: "buyer1@test.co",
      fecha: new Date(),
    });
    await setDoc(doc(db, "testimonios", "active1", "privado", "autor"), {
      userId: "buyer1",
      createdAt: new Date(),
    });
    await setDoc(doc(db, "ventas", "sale1"), {
      propertyId: "pub1",
      propertyTitle: "Publicada uno",
      operation: "venta",
      sellerId: "seller1",
      buyerName: "Comprador",
      closingValue: 450000000,
      status: "cerrada",
      createdBy: "admin1",
      createdAt: new Date(),
    });

    // Contadores de meses anteriores para validar la consulta ordenada.
    await setDoc(doc(db, "propertyViews", "2026-10__pub1"), {
      month: "2026-10",
      propertyId: "pub1",
      views: 5,
      updatedAt: new Date(),
    });
    await setDoc(doc(db, "propertyViews", "2026-10__pub2"), {
      month: "2026-10",
      propertyId: "pub2",
      views: 9,
      updatedAt: new Date(),
    });
    await setDoc(doc(db, "propertyViews", "2026-10__hidden1"), {
      month: "2026-10",
      propertyId: "hidden1",
      views: 2,
      updatedAt: new Date(),
    });
  });

  const anon = testEnv.unauthenticatedContext();
  const admin = testEnv.authenticatedContext("admin1", {
    email: "admin1@test.co",
  });
  const legacyAdmin = testEnv.authenticatedContext("admin2", {
    email: "admin2@test.co",
  });
  const seller = testEnv.authenticatedContext("seller1", {
    email: "seller1@test.co",
  });
  const seller2 = testEnv.authenticatedContext("seller2", {
    email: "seller2@test.co",
  });
  const buyer = testEnv.authenticatedContext("buyer1", {
    email: "buyer1@test.co",
  });
  const inactive = testEnv.authenticatedContext("inactive1", {
    email: "inactive1@test.co",
  });
  const canonicalBuyer = testEnv.authenticatedContext("both1", {
    email: "both1@test.co",
  });
  const newUser = testEnv.authenticatedContext("new1", {
    email: "nuevo@test.co",
  });
  const newUser2 = testEnv.authenticatedContext("new2", {
    email: "nuevo2@test.co",
  });
  const newUser3 = testEnv.authenticatedContext("new3", {
    email: "nuevo3@test.co",
  });
  const newUser4 = testEnv.authenticatedContext("new4", {
    email: "nuevo4@test.co",
  });
  const newUser5 = testEnv.authenticatedContext("new5", {
    email: "nuevo5@test.co",
  });
  const newUser6 = testEnv.authenticatedContext("new6", {
    email: "nuevo6@test.co",
  });
  const newUser7 = testEnv.authenticatedContext("new7", {
    email: "nuevo7@test.co",
  });
  const newUser8 = testEnv.authenticatedContext("new8", {
    email: "nuevo8@test.co",
  });

  const anonDb = anon.firestore();
  const adminDb = admin.firestore();
  const legacyAdminDb = legacyAdmin.firestore();
  const sellerDb = seller.firestore();
  const seller2Db = seller2.firestore();
  const buyerDb = buyer.firestore();
  const inactiveDb = inactive.firestore();
  const canonicalBuyerDb = canonicalBuyer.firestore();
  const newDb = newUser.firestore();
  const new2Db = newUser2.firestore();
  const new3Db = newUser3.firestore();
  const new4Db = newUser4.firestore();
  const new5Db = newUser5.firestore();
  const new6Db = newUser6.firestore();
  const new7Db = newUser7.firestore();
  const new8Db = newUser8.firestore();

  // --------------------------------------------------------------------
  // Propiedades: lectura pública
  // --------------------------------------------------------------------
  await check("anon lee propiedad publicada", getDoc(doc(anonDb, "propiedades", "pub1")), true);
  await check("anon NO lee propiedad oculta", getDoc(doc(anonDb, "propiedades", "hidden1")), false);
  await check("anon NO lee propiedad legacy sin status", getDoc(doc(anonDb, "propiedades", "legacy1")), false);
  await check(
    "anon lista solo publicadas",
    getDocs(query(collection(anonDb, "propiedades"), where("status", "==", "disponible"))),
    true,
  );
  await check("anon NO lista toda la colección", getDocsFromServer(collection(anonDb, "propiedades")), false);
  await check(
    "anon NO lista propiedades ocultas por estado",
    getDocsFromServer(
      query(collection(anonDb, "propiedades"), where("status", "==", "inactiva")),
    ),
    false,
  );
  await check(
    "anon NO lista propiedades por propietario",
    getDocsFromServer(
      query(collection(anonDb, "propiedades"), where("ownerId", "==", "seller1")),
    ),
    false,
  );
  await check("vendedor lee su propiedad oculta", getDoc(doc(sellerDb, "propiedades", "hidden1")), true);
  await check(
    "vendedor lista sus propiedades",
    getDocs(query(collection(sellerDb, "propiedades"), where("ownerId", "==", "seller1"))),
    true,
  );
  await check(
    "comprador NO lista propiedades ajenas",
    getDocsFromServer(query(collection(buyerDb, "propiedades"), where("ownerId", "==", "seller1"))),
    false,
  );
  await check("admin lista todas las propiedades", getDocs(collection(adminDb, "propiedades")), true);

  // --------------------------------------------------------------------
  // Propiedades: escritura
  // --------------------------------------------------------------------
  await check(
    "vendedor crea propiedad propia",
    setDoc(doc(sellerDb, "propiedades", "newprop1"), {
      ownerId: "seller1",
      ownerName: "Seller",
      ownerEmail: "seller1@test.co",
      title: "Nueva propiedad",
      location: "Envigado",
      price: 300000000,
      type: "Apartamento",
      operation: "venta",
      status: "disponible",
      description: "Descripción válida de prueba.",
      images: [],
      featured: false,
      saleId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "vendedor NO crea propiedad a nombre de otro",
    setDoc(doc(sellerDb, "propiedades", "newprop2"), {
      ownerId: "seller2",
      ownerName: "Seller",
      ownerEmail: "seller1@test.co",
      title: "Nueva propiedad",
      location: "Envigado",
      price: 300000000,
      type: "Apartamento",
      operation: "venta",
      status: "disponible",
      description: "Descripción válida de prueba.",
      images: [],
      featured: false,
      saleId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "vendedor NO crea propiedad destacada",
    setDoc(doc(sellerDb, "propiedades", "newprop3"), {
      ownerId: "seller1",
      ownerName: "Seller",
      title: "Propiedad destacada",
      location: "Envigado",
      price: 300000000,
      type: "Apartamento",
      operation: "venta",
      status: "disponible",
      description: "Descripción válida de prueba.",
      images: [],
      featured: true,
      saleId: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "vendedor edita su propiedad oculta",
    updateDoc(doc(sellerDb, "propiedades", "hidden1"), { status: "disponible" }),
    true,
  );
  await check(
    "vendedor NO se autoasigna destacado",
    updateDoc(doc(sellerDb, "propiedades", "hidden1"), { featured: true }),
    false,
  );
  await check(
    "vendedor NO se autoasigna un cierre",
    updateDoc(doc(sellerDb, "propiedades", "hidden1"), { saleId: "sale1" }),
    false,
  );
  await check(
    "vendedor NO marca vendida su propiedad",
    updateDoc(doc(sellerDb, "propiedades", "pub1"), { status: "vendida" }),
    false,
  );
  await check(
    "admin marca vendida una propiedad",
    updateDoc(doc(adminDb, "propiedades", "pub1"), { status: "vendida" }),
    true,
  );
  await check(
    "admin retira el correo del propietario",
    updateDoc(doc(adminDb, "propiedades", "pub2"), {
      ownerEmail: deleteField(),
    }),
    true,
  );
  await check(
    "admin destaca una propiedad",
    updateDoc(doc(adminDb, "propiedades", "pub2"), { featured: true }),
    true,
  );
  await check(
    "vendedor inactivo NO edita su propiedad",
    updateDoc(doc(inactiveDb, "propiedades", "hidden1"), { status: "disponible" }),
    false,
  );

  // --------------------------------------------------------------------
  // users: lectura y datos sensibles
  // --------------------------------------------------------------------
  await check("anon NO lee usuarios canónicos", getDoc(doc(anonDb, "users", "buyer1")), false);
  await check("anon NO lista usuarios canónicos", getDocs(collection(anonDb, "users")), false);
  await check("comprador lee su perfil canónico", getDoc(doc(buyerDb, "users", "buyer1")), true);
  await check(
    "comprador NO lee el perfil canónico de otro",
    getDoc(doc(buyerDb, "users", "seller1")),
    false,
  );
  await check(
    "comprador lee los datos financieros de su propio perfil",
    getDoc(doc(buyerDb, "users", "buyer1")).then((snapshot) => {
      const data = snapshot.data();
      if (data.cedula !== "1020304050" || data.ingresosMensuales !== 4500000) {
        throw new Error("El perfil no expone los datos esperados al titular.");
      }
    }),
    true,
  );
  await check("admin canónico lee el perfil de otro", getDoc(doc(adminDb, "users", "buyer1")), true);
  await check(
    "admin heredado lee el perfil canónico de otro",
    getDoc(doc(legacyAdminDb, "users", "buyer1")),
    true,
  );
  await check("admin canónico lista usuarios", getDocs(collection(adminDb, "users")), true);
  await check(
    "rol canónico tiene prioridad sobre el rol heredado",
    getDocs(collection(canonicalBuyerDb, "users")),
    false,
  );

  // --------------------------------------------------------------------
  // users: actualización del propio perfil
  // --------------------------------------------------------------------
  await check(
    "usuario actualiza su nombre y teléfono",
    updateDoc(doc(buyerDb, "users", "buyer1"), {
      nombre: "Comprador actualizado",
      telefono: "+57 301 555 0000",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "usuario actualiza sus datos financieros",
    updateDoc(doc(buyerDb, "users", "buyer1"), {
      estadoCivil: "casado",
      ingresosMensuales: 5200000,
      ingresosExtras: 300000,
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "usuario NO cambia su cédula",
    updateDoc(doc(buyerDb, "users", "buyer1"), { cedula: "9999999999" }),
    false,
  );
  await check(
    "usuario NO cambia su correo",
    updateDoc(doc(buyerDb, "users", "buyer1"), { email: "otro@test.co" }),
    false,
  );
  await check(
    "usuario NO cambia su rol",
    updateDoc(doc(buyerDb, "users", "buyer1"), { rol: "Admin" }),
    false,
  );
  await check(
    "usuario NO se desactiva",
    updateDoc(doc(buyerDb, "users", "buyer1"), { activo: false }),
    false,
  );
  await check(
    "usuario NO deja los ingresos en cero",
    updateDoc(doc(buyerDb, "users", "buyer1"), { ingresosMensuales: 0 }),
    false,
  );
  await check(
    "usuario NO retira el consentimiento",
    updateDoc(doc(buyerDb, "users", "buyer1"), { aceptaTratamiento: false }),
    false,
  );
  await check(
    "admin actualiza el rol de un usuario",
    updateDoc(doc(adminDb, "users", "seller1"), {
      rol: "Vendedor",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin desactiva una cuenta canónica",
    updateDoc(doc(adminDb, "users", "seller1"), {
      activo: false,
      deactivatedAt: serverTimestamp(),
      deactivatedBy: "admin1",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin reactiva una cuenta canónica",
    updateDoc(doc(adminDb, "users", "seller1"), {
      activo: true,
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin heredado desactiva una cuenta canónica",
    updateDoc(doc(legacyAdminDb, "users", "buyer1"), {
      activo: false,
      deactivatedAt: serverTimestamp(),
      deactivatedBy: "admin2",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin heredado reactiva una cuenta canónica",
    updateDoc(doc(legacyAdminDb, "users", "buyer1"), {
      activo: true,
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: serverTimestamp(),
    }),
    true,
  );

  // --------------------------------------------------------------------
  // users: registro con datos financieros y consentimiento
  // --------------------------------------------------------------------
  await check(
    "registro crea perfil canónico válido",
    setDoc(doc(newDb, "users", "new1"), registrationPayload("nuevo@test.co")),
    true,
  );
  await check(
    "registro NO crea perfil con ingresos en cero",
    setDoc(
      doc(new2Db, "users", "new2"),
      registrationPayload("nuevo2@test.co", { ingresosMensuales: 0 }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil con ingresos extras negativos",
    setDoc(
      doc(new3Db, "users", "new3"),
      registrationPayload("nuevo3@test.co", { ingresosExtras: -1 }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil sin consentimiento",
    setDoc(
      doc(new4Db, "users", "new4"),
      registrationPayload("nuevo4@test.co", { aceptaTratamiento: false }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil con cédula no numérica",
    setDoc(
      doc(new5Db, "users", "new5"),
      registrationPayload("nuevo5@test.co", { cedula: "ABC12345" }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil con estado civil inválido",
    setDoc(
      doc(new6Db, "users", "new6"),
      registrationPayload("nuevo6@test.co", { estadoCivil: "otro" }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil con tipo de contrato inválido",
    setDoc(
      doc(new7Db, "users", "new7"),
      registrationPayload("nuevo7@test.co", { tipoContrato: "temporal" }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil con rol Admin",
    setDoc(
      doc(new8Db, "users", "new8"),
      registrationPayload("nuevo8@test.co", { rol: "Admin" }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil con correo distinto al token",
    setDoc(
      doc(new8Db, "users", "new8"),
      registrationPayload("otro@test.co"),
    ),
    false,
  );
  await check(
    "registro NO guarda el idioma en Firestore",
    setDoc(
      doc(new8Db, "users", "new8"),
      registrationPayload("nuevo8@test.co", { idioma: "en" }),
    ),
    false,
  );
  await check(
    "registro NO crea perfil con campos financieros incompletos",
    setDoc(
      doc(new8Db, "users", "new8"),
      (() => {
        const { estadoCivil, ...incomplete } = registrationPayload(
          "nuevo8@test.co",
        );
        return incomplete;
      })(),
    ),
    false,
  );

  // --------------------------------------------------------------------
  // usuarios: colección heredada
  // --------------------------------------------------------------------
  await check("anon NO lista usuarios heredados", getDocs(collection(anonDb, "usuarios")), false);
  await check(
    "usuario heredado lee su perfil",
    getDoc(doc(seller2Db, "usuarios", "seller2")),
    true,
  );
  await check(
    "usuario heredado NO lee otro perfil",
    getDoc(doc(seller2Db, "usuarios", "admin2")),
    false,
  );
  await check(
    "admin heredado lista usuarios heredados",
    getDocs(collection(legacyAdminDb, "usuarios")),
    true,
  );
  await check(
    "usuario heredado actualiza su contacto",
    updateDoc(doc(seller2Db, "usuarios", "seller2"), {
      telefono: "+57 302 000 0000",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "usuario heredado NO guarda idioma",
    updateDoc(doc(seller2Db, "usuarios", "seller2"), {
      idioma: "en",
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "usuario heredado NO cambia su rol",
    updateDoc(doc(seller2Db, "usuarios", "seller2"), {
      rol: "Admin",
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "usuario heredado NO cambia su correo",
    updateDoc(doc(seller2Db, "usuarios", "seller2"), {
      email: "otro@test.co",
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "usuario heredado NO edita datos financieros",
    updateDoc(doc(seller2Db, "usuarios", "seller2"), {
      ingresosMensuales: 9000000,
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "admin heredado desactiva una cuenta heredada",
    updateDoc(doc(legacyAdminDb, "usuarios", "seller2"), {
      activo: false,
      deactivatedAt: serverTimestamp(),
      deactivatedBy: "admin2",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "registro heredado crea perfil compatible",
    setDoc(doc(newDb, "usuarios", "new1"), {
      nombre: "Nuevo usuario heredado",
      email: "nuevo@test.co",
      rol: "Comprador",
      activo: true,
      fechaRegistro: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "registro heredado NO crea perfil Admin",
    setDoc(doc(new2Db, "usuarios", "new2"), {
      nombre: "Nuevo admin heredado",
      email: "nuevo2@test.co",
      rol: "Admin",
      activo: true,
    }),
    false,
  );
  await check(
    "registro heredado NO guarda idioma",
    setDoc(doc(new3Db, "usuarios", "new3"), {
      nombre: "Nuevo usuario heredado",
      email: "nuevo3@test.co",
      rol: "Comprador",
      activo: true,
      idioma: "en",
    }),
    false,
  );
  await check(
    "admin canónico lista usuarios heredados",
    getDocs(collection(adminDb, "usuarios")),
    true,
  );

  // --------------------------------------------------------------------
  // propertyViews: contador mensual
  // --------------------------------------------------------------------
  await check(
    "anon lee un contador mensual",
    getDoc(doc(anonDb, "propertyViews", "2026-10__pub1")),
    true,
  );
  await check(
    "anon lista los más vistos del mes con una consulta ordenada",
    getDocs(
      query(
        collection(anonDb, "propertyViews"),
        where("month", "==", "2026-10"),
        orderBy("views", "desc"),
        limit(6),
      ),
    ),
    true,
  );
  await check(
    "anon crea un contador con views = 1",
    setDoc(doc(anonDb, "propertyViews", "2026-10__new1"), {
      month: "2026-10",
      propertyId: "newprop1",
      views: 1,
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "anon NO crea un contador con views distinto de 1",
    setDoc(doc(anonDb, "propertyViews", "2026-10__new2"), {
      month: "2026-10",
      propertyId: "newprop1",
      views: 5,
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "anon NO crea un contador con campos extra",
    setDoc(doc(anonDb, "propertyViews", "2026-10__new3"), {
      month: "2026-10",
      propertyId: "newprop1",
      views: 1,
      ownerId: "seller1",
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "anon NO crea un contador con mes inválido",
    setDoc(doc(anonDb, "propertyViews", "2026-1__new4"), {
      month: "2026-1",
      propertyId: "newprop1",
      views: 1,
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "anon NO crea un contador sin propertyId",
    setDoc(doc(anonDb, "propertyViews", "2026-10__new5"), {
      month: "2026-10",
      propertyId: "",
      views: 1,
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "anon incrementa exactamente 1 con increment()",
    setDoc(
      doc(anonDb, "propertyViews", "2026-11__pub1"),
      {
        month: "2026-11",
        propertyId: "pub1",
        views: increment(1),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
    true,
  );
  await check(
    "segundo incremento con increment(1) suma 1",
    updateDoc(doc(anonDb, "propertyViews", "2026-11__pub1"), {
      views: increment(1),
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "el contador quedó en 2 visitas",
    getDoc(doc(anonDb, "propertyViews", "2026-11__pub1")).then((snapshot) => {
      if (snapshot.data().views !== 2) {
        throw new Error(`visitas inesperadas: ${snapshot.data().views}`);
      }
    }),
    true,
  );
  await check(
    "anon NO incrementa 2 en una sola escritura",
    updateDoc(doc(anonDb, "propertyViews", "2026-11__pub1"), {
      views: increment(2),
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "anon NO asigna un valor arbitrario",
    updateDoc(doc(anonDb, "propertyViews", "2026-11__pub1"), {
      views: 100,
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "anon NO cambia el mes del contador",
    updateDoc(doc(anonDb, "propertyViews", "2026-11__pub1"), {
      month: "2026-12",
      updatedAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "anon NO borra un contador",
    deleteDoc(doc(anonDb, "propertyViews", "2026-11__pub1")),
    false,
  );
  await check(
    "admin tampoco borra un contador",
    deleteDoc(doc(adminDb, "propertyViews", "2026-11__pub1")),
    false,
  );

  // --------------------------------------------------------------------
  // Testimonios
  // --------------------------------------------------------------------
  await check("anon lee testimonio activo", getDoc(doc(anonDb, "testimonios", "active1")), true);
  await check("anon lee testimonio aprobado", getDoc(doc(anonDb, "testimonios", "approved1")), true);
  await check("anon NO lee testimonio pendiente", getDoc(doc(anonDb, "testimonios", "pending1")), false);
  await check("anon NO lee testimonio inactivo", getDoc(doc(anonDb, "testimonios", "inactive1")), false);
  await check(
    "anon lista testimonios activos y aprobados",
    getDocs(query(collection(anonDb, "testimonios"), where("estado", "in", ["activo", "aprobado"]))),
    true,
  );
  await check(
    "anon NO lista testimonios pendientes",
    getDocs(query(collection(anonDb, "testimonios"), where("estado", "==", "pendiente"))),
    false,
  );
  await check("admin lista todos los testimonios", getDocs(collection(adminDb, "testimonios")), true);
  await check(
    "comprador crea su testimonio pendiente",
    setDoc(doc(buyerDb, "testimonios", "newtest1"), {
      nombre: "Comprador",
      profesion: "",
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "pendiente",
      fecha: "2026-10-30",
      fechaCreacion: serverTimestamp(),
    }),
    true,
  );
  await check(
    "comprador NO crea testimonio ya aprobado",
    setDoc(doc(buyerDb, "testimonios", "newtest2"), {
      nombre: "Comprador",
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "aprobado",
    }),
    false,
  );
  await check(
    "comprador NO crea testimonio con correo público",
    setDoc(doc(buyerDb, "testimonios", "newtest3"), {
      nombre: "Comprador",
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "pendiente",
      email: "buyer1@test.co",
    }),
    false,
  );
  await check(
    "comprador NO crea testimonio con userId público",
    setDoc(doc(buyerDb, "testimonios", "newtest4"), {
      nombre: "Comprador",
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "pendiente",
      userId: "buyer1",
    }),
    false,
  );
  await check(
    "comprador crea su metadato privado de autor",
    setDoc(doc(buyerDb, "testimonios", "newtest1", "privado", "autor"), {
      userId: "buyer1",
      createdAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "comprador NO crea metadato privado a nombre de otro",
    setDoc(doc(buyerDb, "testimonios", "newtest1", "privado", "otro"), {
      userId: "seller1",
      createdAt: serverTimestamp(),
    }),
    false,
  );
  await check(
    "vendedor NO lee el metadato privado del autor",
    getDoc(doc(sellerDb, "testimonios", "active1", "privado", "autor")),
    false,
  );
  await check(
    "admin lee el metadato privado del autor",
    getDoc(doc(adminDb, "testimonios", "active1", "privado", "autor")),
    true,
  );
  await check(
    "comprador NO cambia el estado de su testimonio",
    updateDoc(doc(buyerDb, "testimonios", "newtest1"), {
      estado: "aprobado",
    }),
    false,
  );
  await check(
    "admin aprueba un testimonio pendiente",
    updateDoc(doc(adminDb, "testimonios", "newtest1"), {
      estado: "aprobado",
      moderatedAt: serverTimestamp(),
      moderatedBy: "admin1",
    }),
    true,
  );
  await check(
    "admin completa el estado de un testimonio heredado",
    updateDoc(doc(adminDb, "testimonios", "legacy1"), {
      estado: "pendiente",
      updatedAt: serverTimestamp(),
    }),
    true,
  );

  // --------------------------------------------------------------------
  // Ventas y auditoría
  // --------------------------------------------------------------------
  await check("anon NO lee ventas", getDoc(doc(anonDb, "ventas", "sale1")), false);
  await check("admin lee ventas", getDoc(doc(adminDb, "ventas", "sale1")), true);
  await check(
    "vendedor escribe auditoría propia",
    setDoc(doc(sellerDb, "auditLog", "audit1"), {
      action: "softDeleteProperty",
      actorId: "seller1",
      actorEmail: "seller1@test.co",
      targetType: "propiedad",
      targetId: "hidden1",
      details: {},
      createdAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin registra la auditoría de migración",
    setDoc(doc(adminDb, "auditLog", "audit-backfill"), {
      action: "backfillLegacyData",
      actorId: "admin1",
      actorEmail: "admin1@test.co",
      targetType: "sistema",
      targetId: "legacy",
      details: { propertiesUpdated: 1, testimonialsUpdated: 1 },
      createdAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin registra la aprobación de un testimonio",
    setDoc(doc(adminDb, "auditLog", "audit-approve-testimonial"), {
      action: "approveTestimonial",
      actorId: "admin1",
      actorEmail: "admin1@test.co",
      targetType: "testimonio",
      targetId: "newtest1",
      details: { nombre: "Comprador" },
      createdAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin registra el retiro de un testimonio",
    setDoc(doc(adminDb, "auditLog", "audit-reject-testimonial"), {
      action: "rejectTestimonial",
      actorId: "admin1",
      actorEmail: "admin1@test.co",
      targetType: "testimonio",
      targetId: "inactive1",
      details: { nombre: "Oculto" },
      createdAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "vendedor NO escribe auditoría ajena",
    setDoc(doc(sellerDb, "auditLog", "audit2"), {
      action: "softDeleteProperty",
      actorId: "seller2",
      targetType: "propiedad",
      targetId: "hidden1",
      details: {},
      createdAt: serverTimestamp(),
    }),
    false,
  );
  await check("anon NO lee auditoría", getDoc(doc(anonDb, "auditLog", "audit1")), false);
  await check("admin lee auditoría", getDoc(doc(adminDb, "auditLog", "audit1")), true);

  console.log(results.join("\n"));
  console.log(
    `\n${results.filter((line) => line.startsWith("PASS")).length}/${results.length} pruebas aprobadas`,
  );

  await testEnv.cleanup();
  process.exit(results.some((line) => line.startsWith("FAIL")) ? 1 : 0);
})().catch((error) => {
  console.error("ERROR GENERAL", error);
  process.exit(1);
});
