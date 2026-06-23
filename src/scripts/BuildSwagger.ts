import { buildSwaggerFile } from '../config/SwaggerConfig';

async function main(): Promise<void> {
  const filePath = await buildSwaggerFile();
  console.log(`Swagger document written to ${filePath}`);
}

void main();
