const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getDocsFromServer,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} = require("firebase/firestore");

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

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: "demo-manuela",
    firestore: { rules, host: "127.0.0.1", port: 8080 },
  });

  await testEnv.clearFirestore();

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const users = [
      ["admin1", "Admin", true, "admin1@test.co"],
      ["admin2", "Administrador", true, "admin2@test.co"],
      ["seller1", "Vendedor", true, "seller1@test.co"],
      ["seller2", "Vendedor", true, "seller2@test.co"],
      ["buyer1", "Comprador", true, "buyer1@test.co"],
      ["inactive1", "Vendedor", false, "inactive1@test.co"],
    ];
    for (const [id, rol, activo, email] of users) {
      await setDoc(doc(db, "usuarios", id), {
        nombre: id,
        email,
        rol,
        activo,
        fechaRegistro: new Date(),
      });
    }

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
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "activo",
      userId: "buyer1",
      fecha: new Date(),
    });
    await setDoc(doc(db, "testimonios", "inactive1"), {
      nombre: "Oculto",
      texto: "Este testimonio no debe ser visible públicamente.",
      rating: 5,
      estado: "inactivo",
      userId: "buyer1",
      fecha: new Date(),
    });
    await setDoc(doc(db, "testimonios", "legacy1"), {
      nombre: "Heredado",
      texto: "Un testimonio heredado sin estado que debe completarse.",
      rating: 5,
      userId: "buyer1",
      fecha: new Date(),
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
  const newUser = testEnv.authenticatedContext("new1", {
    email: "nuevo@test.co",
  });
  const newUser2 = testEnv.authenticatedContext("new2", {
    email: "nuevo2@test.co",
  });

  const anonDb = anon.firestore();
  const adminDb = admin.firestore();
  const legacyAdminDb = legacyAdmin.firestore();
  const sellerDb = seller.firestore();
  const seller2Db = seller2.firestore();
  const buyerDb = buyer.firestore();
  const inactiveDb = inactive.firestore();
  const newDb = newUser.firestore();
  const new2Db = newUser2.firestore();

  // Propiedades: lectura pública
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

  // Propiedades: escritura
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

  // Usuarios
  await check("anon NO lista usuarios", getDocs(collection(anonDb, "usuarios")), false);
  await check("comprador lee su perfil", getDoc(doc(buyerDb, "usuarios", "buyer1")), true);
  await check("comprador NO lee otro perfil", getDoc(doc(buyerDb, "usuarios", "seller1")), false);
  await check("admin lista usuarios", getDocs(collection(adminDb, "usuarios")), true);
  await check(
    "admin legacy lista usuarios",
    getDocs(collection(legacyAdminDb, "usuarios")),
    true,
  );
  await check(
    "usuario actualiza su nombre",
    updateDoc(doc(buyerDb, "usuarios", "buyer1"), {
      nombre: "Comprador actualizado",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "usuario NO cambia su rol",
    updateDoc(doc(buyerDb, "usuarios", "buyer1"), { rol: "Admin" }),
    false,
  );
  await check(
    "admin desactiva una cuenta",
    updateDoc(doc(adminDb, "usuarios", "seller2"), {
      activo: false,
      deactivatedAt: serverTimestamp(),
      deactivatedBy: "admin1",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "admin legacy desactiva una cuenta",
    updateDoc(doc(legacyAdminDb, "usuarios", "seller2"), {
      activo: false,
      deactivatedAt: serverTimestamp(),
      deactivatedBy: "admin2",
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "registro crea perfil Comprador",
    setDoc(doc(newDb, "usuarios", "new1"), {
      nombre: "Nuevo usuario",
      cedula: "",
      fechaNacimiento: "",
      email: "nuevo@test.co",
      telefono: "",
      direccion: "",
      avatar: "",
      rol: "Comprador",
      activo: true,
      fechaRegistro: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
    true,
  );
  await check(
    "registro NO crea perfil Admin",
    setDoc(doc(new2Db, "usuarios", "new2"), {
      nombre: "Nuevo admin",
      email: "nuevo2@test.co",
      rol: "Admin",
      activo: true,
    }),
    false,
  );

  // Testimonios
  await check("anon lee testimonio activo", getDoc(doc(anonDb, "testimonios", "active1")), true);
  await check("anon NO lee testimonio inactivo", getDoc(doc(anonDb, "testimonios", "inactive1")), false);
  await check(
    "anon lista testimonios activos",
    getDocs(query(collection(anonDb, "testimonios"), where("estado", "in", ["activo", "aprobado"]))),
    true,
  );
  await check("admin lista todos los testimonios", getDocs(collection(adminDb, "testimonios")), true);
  await check(
    "comprador crea su testimonio",
    setDoc(doc(buyerDb, "testimonios", "newtest1"), {
      nombre: "Comprador",
      profesion: "",
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "activo",
      fecha: "2026-10-30",
      fechaCreacion: serverTimestamp(),
      userId: "buyer1",
      email: "buyer1@test.co",
    }),
    true,
  );
  await check(
    "comprador NO crea testimonio a nombre de otro",
    setDoc(doc(buyerDb, "testimonios", "newtest2"), {
      nombre: "Comprador",
      texto: "Una experiencia excelente con el acompañamiento recibido.",
      rating: 5,
      estado: "activo",
      userId: "seller1",
    }),
    false,
  );
  await check(
    "admin completa el estado de un testimonio heredado",
    updateDoc(doc(adminDb, "testimonios", "legacy1"), {
      estado: "activo",
      updatedAt: serverTimestamp(),
    }),
    true,
  );

  // Ventas y auditoría
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
  console.log(`\n${results.filter((line) => line.startsWith("PASS")).length}/${results.length} pruebas aprobadas`);

  await testEnv.cleanup();
  process.exit(results.some((line) => line.startsWith("FAIL")) ? 1 : 0);
})().catch((error) => {
  console.error("ERROR GENERAL", error);
  process.exit(1);
});
