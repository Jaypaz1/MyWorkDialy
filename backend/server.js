const express = require("express");
const cors = require("cors");
const sql = require("mssql");

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de conexión a SQL Server
const dbConfig = {
  user: "comedor",
  password: "banana19",
  server: "Mxdbnew",
  database: "IOTrackingSystem",
  options: {
    encrypt: true,   // Usar cifrado
    trustServerCertificate: true  // Deshabilitar la validación del certificado SSL
  }
};

// Ruta para obtener las wrappers con status = 1
app.get("/api/wrapper", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    
    // Consulta SQL para obtener wrappers con status = 1
    const result = await pool.request()
      .query(
        `SELECT IdCatalogoWrapper, Wrapper 
         FROM Catalogo_Wrapper 
         WHERE Status_Wrapper = 1`
      );
    
    // Devolver los resultados
    res.json(result.recordset);
  } catch (error) {
    console.error("Error fetching wrappers:", error);
    res.status(500).send("Error fetching wrappers data");
  }
});

// Ruta para calcular uptime
app.get("/api/uptime", async (req, res) => {
  const { Wrapper, FechaRegistro, EndDate } = req.query;

  console.log("Wrapper:", Wrapper);
  console.log("FechaRegistro:", FechaRegistro);
  console.log("EndDate:", EndDate);

  try {
    // Verificar que las fechas estén en el formato correcto
    if (!FechaRegistro || !EndDate) {
      return res.status(400).send("FechaRegistro and EndDate are required");
    }

    const pool = await sql.connect(dbConfig);

    // Consulta SQL para obtener los datos de uptime de la base de datos
    const result = await pool.request()
      .input("Wrapper", sql.Int, Wrapper)  // Usa machineId de la consulta para filtrar por la máquina
      .input("FechaRegistro", sql.DateTime, new Date(FechaRegistro)) // Asegúrate de que 'startDate' sea un objeto Date válido
      .input("EndDate", sql.DateTime, new Date(EndDate))     // Lo mismo para 'endDate'
      .query(
        `SELECT 
          SUM(CASE WHEN ws.DescripcionEstado IN ('Production', 'Validation') THEN TiempoMin ELSE 0 END) AS ActiveMinutes,
          SUM(TiempoMin) AS TotalMinutes
        FROM Wrapper_DownTimes dt
        INNER JOIN Wrapper_Status ws ON dt.IdWrapperStatus = ws.IdWrapper_Status
        WHERE dt.IdWrapper = @Wrapper
          AND dt.FechaRegistro BETWEEN @FechaRegistro AND @EndDate`
      );

    const { ActiveMinutes = 0, TotalMinutes = 0 } = result.recordset[0] || {};

    // Manejo de casos donde no haya registros
    if (TotalMinutes === 0) {
      return res.json({ uptimePercentage: 0, downtimePercentage: 100, activeMinutes: 0 });
    }

    const uptimePercentage = ((ActiveMinutes / TotalMinutes) * 100).toFixed(2);
    const downtimePercentage = (100 - uptimePercentage).toFixed(2);

    res.json({ uptimePercentage, downtimePercentage, activeMinutes: ActiveMinutes });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Error fetching uptime data");
  }
});

// Servidor en el puerto 5000
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
