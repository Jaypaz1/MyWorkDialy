import React, { useState, useEffect } from 'react';

function UptimeCalculator() {
  const [FechaRegistro, setFechaRegistro] = useState(""); // Fecha de inicio
  const [EndDate, setEndDate] = useState(""); // Fecha de fin
  const [wrappers, setWrappers] = useState([]); // Lista de wrappers
  const [Wrapper, setWrapper] = useState(""); // Wrapper seleccionado
  const [results, setResults] = useState(null); // Resultados
  const [loading, setLoading] = useState(false); // Indicador de carga

  // Función para obtener las wrappers con status = 1
  const fetchWrappers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/wrapper"); // Cambia la URL si es necesario
      const data = await response.json();
      setWrappers(data); // Guardar las wrappers en el estado
    } catch (error) {
      console.error("Error fetching wrappers:", error);
    }
  };

  useEffect(() => {
    fetchWrappers(); // Cargar las wrappers cuando el componente se monte
  }, []);

  const calculateUptime = async () => {
    setLoading(true);
    setResults(null); // Limpiar resultados anteriores
    try {
      // Validar que el usuario ha seleccionado un wrapper y ha ingresado fechas
      if (!Wrapper || !FechaRegistro || !EndDate) {
        alert("Por favor, selecciona una máquina y completa las fechas.");
        setLoading(false);
        return;
      }

      // Convertir las fechas a formato ISO 8601
      const FechaRegistroISO = new Date(FechaRegistro).toISOString();
      const EndDateISO = new Date(EndDate).toISOString();

      const response = await fetch(
        `http://localhost:5000/api/uptime?Wrapper=${Wrapper}&FechaRegistro=${FechaRegistroISO}&EndDate=${EndDateISO}`
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching uptime:", error);
      alert("Error al obtener los datos. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Uptime Calculator</h2>

      {/* Sección de Selección */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Machine:</strong>
        </label>
        <select
          onChange={(e) => setWrapper(e.target.value)} // Actualiza el estado con la máquina seleccionada
          style={{ marginLeft: "10px", padding: "5px" }}
        >
          <option value="">Select Machine</option>
          {wrappers.map((wrapper) => (
            <option key={wrapper.IdCatalogoWrapper} value={wrapper.IdCatalogoWrapper}>
              {wrapper.Wrapper}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Start Date:</strong>
        </label>
        <input
          type="datetime-local"
          onChange={(e) => setFechaRegistro(e.target.value)} // Actualiza FechaRegistro
          style={{ marginLeft: "10px", padding: "5px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>End Date:</strong>
        </label>
        <input
          type="datetime-local"
          onChange={(e) => setEndDate(e.target.value)} // Actualiza EndDate
          style={{ marginLeft: "10px", padding: "5px" }}
        />
      </div>

      <button
        onClick={calculateUptime}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        {loading ? "Calculating..." : "Calculate"}
      </button>

      {/* Sección de Resultados */}
      {results && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>Results</h3>
          <p>
            <strong>Uptime:</strong> {results.uptimePercentage}%
          </p>
          <p>
            <strong>Downtime:</strong> {results.downtimePercentage}%
          </p>
          <p>
            <strong>Total Active Time:</strong> {results.activeMinutes} minutes
          </p>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && <p style={{ marginTop: "20px" }}>Calculating uptime...</p>}
    </div>
  );
}

export default UptimeCalculator;
