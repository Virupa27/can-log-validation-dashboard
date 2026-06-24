# Contributing

Thank you for your interest in contributing to the CAN Log Validation Dashboard.

## Prerequisites

Before running the project, install:

* Python 3.10+
* Node.js 18+
* npm
* Git

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will be available at:

```
http://127.0.0.1:8000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

## How to Contribute

* Fork the repository.
* Create a feature branch.
* Implement your changes.
* Test your changes.
* Submit a Pull Request with a clear description.

## Coding Guidelines

* Write clean and readable code.
* Follow existing project structure.
* Keep functions modular.
* Add comments where necessary.
* Test before submitting changes.

## Reporting Issues

If you discover a bug or have a feature request, please open an issue describing:

* Steps to reproduce
* Expected behavior
* Actual behavior
* Screenshots or logs (if applicable)
