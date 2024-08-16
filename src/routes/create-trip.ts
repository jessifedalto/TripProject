import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {z} from "zod"
import { prisma } from "../lib/prisma"
import dayjs from "dayjs";
import { ClientError } from "../errors/client-error";


export async function createTrip(app: FastifyInstance){
    app.withTypeProvider<ZodTypeProvider>().post('/trips',{
        schema: {
            body: z.object({
                destination: z.string().min(4),
                starts_at: z.coerce.date(),//convert string date do date date.
                ends_at: z.coerce.date(),//convert string date do date date.
                owner_name: z.string(),
                owner_email: z.string().email(),
                emails_to_invite: z.array(z.string().email())
            })
        }
    } ,async (request) => {
       const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body

       if(dayjs(starts_at).isBefore(new Date())){
        throw new ClientError('Invalid trip starts date')
       }

       if(dayjs(ends_at).isBefore(starts_at)){
        throw new ClientError('Invalid trip starts date. Start date is after end date.')
       }

        const trip = await prisma.trip.create({
            data: {
                destination,
                starts_at,
                ends_at,
                participant: {
                    createMany: {
                        data: [
                            {
                            name: owner_name,
                            email: owner_email,
                            is_owner: true,
                            is_confirmed: true,
                            },
                            ...emails_to_invite.map(email => {
                                return { email }
                            })
                        ],
                    }
                }
            }
        });

       return { tripId : trip.id };
    })
}