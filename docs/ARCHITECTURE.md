# Architecture Overview

## Project Name

CAN Log Validation Dashboard

## Purpose

This application helps analyze automotive CAN log CSV files and detect validation issues such as low battery voltage, signal spikes, and abnormal CAN message behavior.

## High-Level Flow

User uploads CAN log CSV file.

React frontend sends the file to the FastAPI backend.

FastAPI reads the CSV using Pandas.

Validation logic checks for abnormal signal conditions.

Backend returns analysis results to the frontend.

React dashboard displays validation summary, health score, charts, detected issues, recommendations, and report download options.

## Architecture Diagram

```text
User
 |
 v
React Frontend
 |
 | Upload CSV
 v
FastAPI Backend
 |
 | Parse CSV
 v
Pandas Data Processing
 |
 | Analyze Signals
 v
Validation Engine
 |
 | Results
 v
React Dashboard
 |
 | Export
 v
PDF / Text Report