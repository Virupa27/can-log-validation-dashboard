# CAN Log Validation Dashboard

An automotive CAN Log Analysis and Validation Dashboard built using React, FastAPI, Python, Pandas, and Chart.js.

## Overview

This project analyzes CAN bus log files and automatically detects validation issues commonly encountered during ECU and vehicle testing.

The dashboard allows users to:

* Upload CAN log CSV files
* Analyze CAN messages
* Detect abnormal signal behavior
* Generate validation reports
* Visualize issue severity
* Monitor signal frequency
* Export PDF and text reports

## Features

### File Upload & Analysis

* Upload any CAN log CSV file
* Real-time log validation
* Automatic issue detection

### Validation Dashboard

* System health score
* PASS / FAIL status
* Message statistics
* CAN ID statistics
* Signal statistics

### Visualization

* Severity distribution chart
* Signal frequency chart
* Issue summary dashboard

### Reporting

* Download PDF report
* Download text report
* Validation recommendations

## Technology Stack

### Frontend

* React
* Vite
* Chart.js
* Axios

### Backend

* FastAPI
* Python
* Pandas
* Uvicorn

## Project Structure

```text
can-log-validation-dashboard/
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── sample-data/
    └── can_log.csv
```

## Sample Validation Checks

* Low Battery Voltage
* Vehicle Speed Spike
* Invalid Signal Values
* Missing CAN Messages
* Signal Threshold Violations

## Future Enhancements

* DBC file support
* BLF and ASC log support
* Live CAN streaming
* Advanced signal decoding
* Authentication and user management
* Cloud deployment

## Author

Virupa Kondepati

Automotive Software Validation Engineer

GitHub: https://github.com/Virupa27
