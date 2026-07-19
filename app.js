const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const HttpInstrumentation = require('@opentelemetry/instrumentation-http').HttpInstrumentation;
const ExpressInstrumentation = require('@opentelemetry/instrumentation-express').ExpressInstrumentation;
const express = require('express');

// Initialize the tracer provider
const provider = new NodeTracerProvider();

// Set up the Collector trace exporter
const exporter = new CollectorTraceExporter({
  url: 'http://localhost:4317', // Change to your OpenTelemetry Collector endpoint
});

// Set up the span processor
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

// Register instrumentations for HTTP and Express
registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

// Register the provider to activate the tracer
provider.register();

// Export the tracer for usage in your application
const tracer = provider.getTracer('example-tracer');

// Example usage in an Express route
const app = express();

app.get('/', (req, res) => {
  const span = tracer.startSpan('handling_request');
  
  // Simulate some processing
  setTimeout(() => {
    span.end(); // End the span
    res.send('Hello World!');
  }, 100);
});

const PORT = 3090;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
