FROM python:3.10-slim
WORKDIR /app
COPY main.py .
RUN pip install redis requests
CMD ["python", "main.py"]
