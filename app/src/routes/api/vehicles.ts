import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../db/client.server'
import { vehicles } from '../../db/schema'
export const Route=createFileRoute('/api/vehicles')({server:{handlers:{GET:async()=>Response.json(await db.select().from(vehicles).orderBy(vehicles.make,vehicles.model))}}})
