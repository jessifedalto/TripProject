import fastify from "fastify";
import cors from "@fastify/cors"
import { validatorCompiler, serializerCompiler } from "fastify-type-provider-zod";
import { createTrip } from "./routes/create-trip";

const app = fastify();

app.register(cors, {
    origin: '*',
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip);