import { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchText, setSearchText] = useState("");

  async function uploadAndAnalyze() {
    if (!file) {
      alert("Please choose a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:8000/upload-log", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    setResult(data);

    setHistory([
      {
        fileName: file.name,
        messages: data.summary.total_messages,
        result: data.summary.test_result,
        errors: data.summary.errors_found,
        time: new Date().toLocaleString(),
      },
      ...history,
    ]);
  }

  function downloadTextReport() {
    window.open("http://127.0.0.1:8000/download-report", "_blank");
  }

  function downloadPdfReport() {
    window.open("http://127.0.0.1:8000/download-pdf-report", "_blank");
  }

  const filteredIssues = result
    ? result.detected_issues.filter((issue) =>
        issue.signal.toLowerCase().includes(searchText.toLowerCase())
      )
    : [];

  const severityChartData = result
    ? {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            data: [
              result.summary.high_count,
              result.summary.medium_count,
              result.summary.low_count,
            ],
            backgroundColor: ["#dc2626", "#facc15", "#22c55e"],
          },
        ],
      }
    : null;

  const signalChartData = result
    ? {
        labels: Object.keys(result.signal_counts),
        datasets: [
          {
            label: "Signal Count",
            data: Object.values(result.signal_counts),
            backgroundColor: "#2563eb",
          },
        ],
      }
    : null;

  return (
    <div style={pageStyle}>
      <div
        style={{
          ...headerStyle,
          background:
            result?.summary?.test_result === "PASS" ? "#166534" : "#1f2937",
        }}
      >
        <h1 style={{ color: "white" }}>CAN Log Validation Dashboard</h1>
        <p>Automotive ECU Validation | CAN Diagnostics | FastAPI + React</p>

        {result && (
          <div style={badgeRow}>
            <span style={badge}>Uploaded</span>
            <span style={badge}>Parsed</span>
            <span
              style={{
                ...badge,
                background:
                  result.summary.test_result === "PASS" ? "#16a34a" : "#dc2626",
              }}
            >
              {result.summary.test_result}
            </span>
          </div>
        )}
      </div>

      <div style={uploadBox}>
        <h2>Upload CAN Log File</h2>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {file && <p>Selected File: {file.name}</p>}

        <button onClick={uploadAndAnalyze} style={primaryButton}>
          Upload and Analyze
        </button>
      </div>

      {result && (
        <>
          <div style={sectionStyle}>
            <h2>Validation Summary</h2>
            <p><strong>Project:</strong> CAN ECU Validation</p>
            <p><strong>File:</strong> {file?.name}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> {result.summary.test_result}</p>
          </div>

          <div style={healthBox}>
            <h2>System Health Score</h2>
            <h1
              style={{
                color:
                  result.summary.health_score >= 85
                    ? "#16a34a"
                    : result.summary.health_score >= 60
                    ? "#f59e0b"
                    : "#dc2626",
              }}
            >
              {result.summary.health_score}%
            </h1>
            <p>
              {result.summary.health_score >= 85
                ? "Healthy"
                : result.summary.health_score >= 60
                ? "Needs Attention"
                : "Critical"}
            </p>
          </div>

          <div style={cardContainer}>
            <div style={cardStyle}>
              <h3>📡 Total Messages</h3>
              <h2>{result.summary.total_messages}</h2>
            </div>

            <div style={cardStyle}>
              <h3>⚠️ Errors</h3>
              <h2>{result.summary.errors_found}</h2>
            </div>

            <div style={cardStyle}>
              <h3>🧩 CAN IDs</h3>
              <h2>{result.summary.unique_can_ids}</h2>
            </div>

            <div style={cardStyle}>
              <h3>📊 Signals</h3>
              <h2>{result.summary.unique_signals}</h2>
            </div>

            <div style={cardStyle}>
              <h3>Validation Status</h3>
              <h2
                style={{
                  color: "white",
                  backgroundColor:
                    result.summary.test_result === "PASS"
                      ? "#16a34a"
                      : "#dc2626",
                  padding: "10px",
                  borderRadius: "8px",
                }}
              >
                {result.summary.test_result === "PASS" ? "✅ PASS" : "❌ FAIL"}
              </h2>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2>Severity Distribution</h2>
            <div style={{ maxWidth: "320px", margin: "0 auto" }}>
              <Doughnut data={severityChartData} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h2>Signal Frequency</h2>
            <div style={{ maxWidth: "650px", margin: "0 auto" }}>
              <Bar data={signalChartData} />
            </div>
          </div>

          <div style={sectionStyle}>
            <h2>Detected Issues</h2>

            <input
              type="text"
              placeholder="Search by signal name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={searchBox}
            />

            {filteredIssues.length === 0 ? (
              <div style={passBox}>
                <h3>No Matching Issues Found</h3>
                <p>Try another signal name.</p>
              </div>
            ) : (
              filteredIssues.map((issue, index) => (
                <div
                  key={index}
                  style={{
                    ...issueCard,
                    backgroundColor:
                      issue.severity === "High" ? "#fee2e2" : "#fef3c7",
                  }}
                >
                  <h3>
                    {issue.severity === "High" ? "🔴" : "🟡"} {issue.severity}
                  </h3>

                  <h2>{issue.signal}</h2>

                  <p><strong>CAN ID:</strong> {issue.can_id}</p>
                  <p><strong>Timestamp:</strong> {issue.timestamp}s</p>
                  <p><strong>Measured Value:</strong> {issue.value}</p>
                  <p><strong>Issue:</strong> {issue.issue}</p>

                  <div style={actionBox}>
                    <h4>Recommended Action</h4>
                    <p>
                      {issue.severity === "High"
                        ? "Inspect ECU power supply, battery voltage, and wiring harness."
                        : "Validate signal scaling, filtering, and message consistency."}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={sectionStyle}>
            <h2>Recommended Corrective Actions</h2>

            {result.recommendations.length === 0 ? (
              <p>No corrective actions required.</p>
            ) : (
              result.recommendations.map((rec, index) => (
                <p key={index}>🔧 {rec}</p>
              ))
            )}

            <button onClick={downloadTextReport} style={darkButton}>
              Download Text Report
            </button>

            <button onClick={downloadPdfReport} style={dangerButton}>
              Download PDF Report
            </button>
          </div>
        </>
      )}

      {history.length > 0 && (
        <div style={sectionStyle}>
          <h2>Upload History</h2>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Messages</th>
                <th>Errors</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>{item.fileName}</td>
                  <td>{item.messages}</td>
                  <td>{item.errors}</td>
                  <td>
                    <span
                      style={{
                        ...tableBadge,
                        background:
                          item.result === "PASS" ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {item.result}
                    </span>
                  </td>
                  <td>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer style={footerStyle}>
        <p>CAN Log Validation Dashboard v1.0</p>
        <p>Developed by Virupa Kondepati</p>
        <p>React • FastAPI • Python • Pandas • Chart.js</p>
      </footer>
    </div>
  );
}

const pageStyle = {
  padding: "30px",
  fontFamily: "Arial",
  textAlign: "center",
  background: "#f8fafc",
  minHeight: "100vh",
};

const headerStyle = {
  color: "white",
  padding: "35px",
  borderRadius: "14px",
  marginBottom: "30px",
};

const badgeRow = {
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  marginTop: "15px",
};

const badge = {
  background: "#2563eb",
  padding: "8px 14px",
  borderRadius: "999px",
  color: "white",
  fontWeight: "bold",
};

const uploadBox = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  margin: "0 auto 30px",
  maxWidth: "700px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const healthBox = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  margin: "30px auto",
  maxWidth: "500px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const cardContainer = {
  display: "flex",
  gap: "20px",
  justifyContent: "center",
  flexWrap: "wrap",
};

const cardStyle = {
  background: "white",
  border: "1px solid #e5e7eb",
  padding: "20px",
  borderRadius: "12px",
  width: "180px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
};

const sectionStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  margin: "30px auto",
  maxWidth: "900px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const issueCard = {
  border: "1px solid #ddd",
  margin: "15px auto",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "700px",
};

const actionBox = {
  marginTop: "15px",
  background: "rgba(255,255,255,0.65)",
  padding: "12px",
  borderRadius: "8px",
};

const passBox = {
  border: "1px solid #bbf7d0",
  backgroundColor: "#dcfce7",
  margin: "15px auto",
  padding: "20px",
  borderRadius: "10px",
  maxWidth: "700px",
};

const searchBox = {
  padding: "10px",
  width: "80%",
  maxWidth: "400px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  marginBottom: "20px",
};

const primaryButton = {
  marginTop: "20px",
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const darkButton = {
  ...primaryButton,
  background: "#111827",
  marginRight: "10px",
};

const dangerButton = {
  ...primaryButton,
  background: "#dc2626",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const tableBadge = {
  color: "white",
  padding: "6px 12px",
  borderRadius: "999px",
  fontWeight: "bold",
};

const footerStyle = {
  marginTop: "40px",
  color: "#6b7280",
};

export default App;