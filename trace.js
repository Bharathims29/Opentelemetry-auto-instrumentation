// Import required modules
const express = require('express');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { trace } = require('@opentelemetry/api');

// Initialize the OpenTelemetry tracer provider with a service name
const provider = new NodeTracerProvider({
  resource: Resource.default().merge(new Resource({
    'service.name': 'my-node-app', // service name here
  })),
});

// Configure the OTLP exporter to send data to the OpenTelemetry Collector via gRPC
const exporter = new OTLPTraceExporter({
  url: 'localhost:4317', // collector's gRPC endpoint
});

// Use the BatchSpanProcessor for better performance
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// Register the provider to begin tracing
provider.register();

// Initialize Auto Instrumentation for the Node.js application
const instrumentations = getNodeAutoInstrumentations();
instrumentations.forEach(instrumentation => instrumentation.enable());

const app = express();

// A simple route to demonstrate tracing
app.get('/', (req, res) => {
  // Start a new span
  const span = trace.getTracer('default').startSpan('handle_request');
  res.send('Hello, world!');
  span.end(); // End the span after the response is sent
});

// Start the Express server
const port = 4080;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
