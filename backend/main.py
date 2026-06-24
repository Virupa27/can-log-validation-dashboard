from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://can-log-validation-dashboard.vercel.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_result = None


@app.get("/")
def home():
    return {"message": "CAN Log Analyzer API is running"}


def analyze_dataframe(df):
    total_messages = len(df)
    error_rows = df[df["status"] != "OK"]

    unique_can_ids = df["can_id"].nunique() if "can_id" in df.columns else 0
    unique_signals = df["signal_name"].nunique() if "signal_name" in df.columns else 0

    issues = []
    recommendations = []

    for _, row in error_rows.iterrows():
        status = str(row["status"]).strip().upper()
        signal_name = str(row["signal_name"]).strip()
        value = row["value"]
        can_id = str(row["can_id"]).strip() if "can_id" in df.columns else "N/A"
        timestamp = row["timestamp"] if "timestamp" in df.columns else "N/A"

        if status == "LOW_VOLTAGE":
            severity = "High"
            issue_text = "Battery voltage dropped below 10V"
            recommendation = "Check battery supply, wiring harness, and ECU reset behavior."

        elif status == "SPIKE" or signal_name == "VehicleSpeed":
            severity = "Medium"
            issue_text = "Vehicle speed spike detected"
            recommendation = "Validate CAN signal scaling, sensor input, and message filtering logic."

        else:
            severity = "Low"
            issue_text = f"Issue detected in {signal_name}"
            recommendation = "Review signal behavior and compare it with expected validation requirements."

        issues.append({
            "timestamp": timestamp,
            "can_id": can_id,
            "signal": signal_name,
            "value": value,
            "issue": issue_text,
            "severity": severity
        })

        recommendations.append(recommendation)

    high_count = sum(1 for issue in issues if issue["severity"] == "High")
    medium_count = sum(1 for issue in issues if issue["severity"] == "Medium")
    low_count = sum(1 for issue in issues if issue["severity"] == "Low")

    health_score = 100 - (len(issues) * 15) - (high_count * 10)
    health_score = max(0, health_score)

    test_result = "PASS" if len(issues) == 0 else "FAIL"

    signal_counts = (
        df["signal_name"]
        .value_counts()
        .to_dict()
        if "signal_name" in df.columns
        else {}
    )

    return {
        "project": "CAN Log Analyzer",
        "summary": {
            "total_messages": total_messages,
            "errors_found": len(error_rows),
            "test_result": test_result,
            "unique_can_ids": unique_can_ids,
            "unique_signals": unique_signals,
            "health_score": health_score,
            "high_count": high_count,
            "medium_count": medium_count,
            "low_count": low_count
        },
        "detected_issues": issues,
        "recommendations": list(dict.fromkeys(recommendations)),
        "signal_counts": signal_counts
    }


@app.post("/upload-log")
async def upload_log(file: UploadFile = File(...)):
    global latest_result
    df = pd.read_csv(file.file)
    latest_result = analyze_dataframe(df)
    return latest_result


@app.get("/download-report")
def download_report():
    global latest_result

    if latest_result is None:
        return {"error": "No analysis result available. Upload and analyze a file first."}

    report_path = "validation_report.txt"

    with open(report_path, "w") as report:
        report.write("CAN Log Analyzer Validation Report\n")
        report.write("==================================\n\n")
        report.write(f"Generated On: {datetime.now()}\n\n")

        report.write("Summary\n")
        report.write("-------\n")
        for key, value in latest_result["summary"].items():
            report.write(f"{key}: {value}\n")

        report.write("\nDetected Issues\n")
        report.write("---------------\n")

        if len(latest_result["detected_issues"]) == 0:
            report.write("No issues found.\n")
        else:
            for issue in latest_result["detected_issues"]:
                report.write(f"Signal: {issue['signal']}\n")
                report.write(f"CAN ID: {issue['can_id']}\n")
                report.write(f"Timestamp: {issue['timestamp']}s\n")
                report.write(f"Value: {issue['value']}\n")
                report.write(f"Issue: {issue['issue']}\n")
                report.write(f"Severity: {issue['severity']}\n\n")

        report.write("Recommendations\n")
        report.write("---------------\n")
        for rec in latest_result["recommendations"]:
            report.write(f"- {rec}\n")

    return FileResponse(report_path, media_type="text/plain", filename="validation_report.txt")


@app.get("/download-pdf-report")
def download_pdf_report():
    global latest_result

    if latest_result is None:
        return {"error": "No analysis result available. Upload and analyze a file first."}

    pdf_path = "validation_report.pdf"

    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter
    y = height - 50

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "CAN Log Analyzer Validation Report")

    y -= 25
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Generated On: {datetime.now()}")

    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Summary")

    y -= 25
    c.setFont("Helvetica", 11)

    for key, value in latest_result["summary"].items():
        c.drawString(50, y, f"{key}: {value}")
        y -= 18

    y -= 20
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Detected Issues")

    y -= 25
    c.setFont("Helvetica", 10)

    if len(latest_result["detected_issues"]) == 0:
        c.drawString(50, y, "No issues found.")
        y -= 20
    else:
        for issue in latest_result["detected_issues"]:
            if y < 100:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 10)

            c.drawString(50, y, f"Signal: {issue['signal']}")
            y -= 15
            c.drawString(50, y, f"CAN ID: {issue['can_id']}")
            y -= 15
            c.drawString(50, y, f"Timestamp: {issue['timestamp']}s")
            y -= 15
            c.drawString(50, y, f"Value: {issue['value']}")
            y -= 15
            c.drawString(50, y, f"Issue: {issue['issue']}")
            y -= 15
            c.drawString(50, y, f"Severity: {issue['severity']}")
            y -= 30

    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y, "Recommendations")

    y -= 25
    c.setFont("Helvetica", 10)

    for rec in latest_result["recommendations"]:
        if y < 80:
            c.showPage()
            y = height - 50
            c.setFont("Helvetica", 10)

        c.drawString(50, y, f"- {rec}")
        y -= 18

    c.save()

    return FileResponse(pdf_path, media_type="application/pdf", filename="validation_report.pdf")