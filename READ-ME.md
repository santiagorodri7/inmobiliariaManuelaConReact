# Inmobiliaria Manuela

Aplicación de una sola página creada con React y Vite. Las pantallas viven en
`src/pages/` como componentes JSX y las rutas conservan las URL `.html` para
mantener los enlaces existentes. `index.html` es la única plantilla HTML y
monta la aplicación en `src/main.jsx`.

## Desarrollo

Requisitos: Node.js y npm.

```bash
npm install
npm run dev
npm run build
```

La aplicación usa Firebase para autenticación, perfiles, propiedades y
testimonios. El formulario de contacto envía sus datos a `mail/contact.php`;
para usarlo en producción hace falta un servidor con PHP y configurar allí la
dirección de correo receptora y el envío de correo. El servidor de desarrollo
de Vite no ejecuta PHP.

## Publicación

`npm run build` genera la aplicación en `dist/`, copia los recursos estáticos y
crea `dist/404.html` como fallback para alojamientos estáticos que lo admitan.
Configura el hosting para servir `index.html` para las rutas de la aplicación.

Los estilos y recursos visuales existentes se mantienen en `css/`, `img/` y
`lib/`; la lógica de interfaz se maneja desde React y los scripts de interfaz
antiguos ya no forman parte de la aplicación. `setup.html` fue retirado del
flujo de creación de cuentas administrativas: consulta `src/pages/setup.jsx`
para las instrucciones de configuración segura.
