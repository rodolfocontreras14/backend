// CONTROLADOR DE AUTENTICACIÓN

const login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    // Aquí irá tu lógica real de base de datos más adelante.
    // Por ahora, validamos un usuario de prueba para Postman:
    if (usuario === "admin" && contrasena === "123456") {
      return res.json({
        ok: true,
        message: '¡Inicio de sesión exitoso!',
        user: { usuario: "admin", rol: "administrador" }
      });
    } else {
      return res.status(400).json({
        ok: false,
        message: 'Usuario o contraseña incorrectos'
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      message: 'Error en el servidor'
    });
  }
};

// 🔴 LA CLAVE: Exportar como objeto con llaves para que coincida con el require
module.exports = {
  login
};