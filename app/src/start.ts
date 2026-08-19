import { createCsrfMiddleware,createStart } from '@tanstack/react-start'
const csrf=createCsrfMiddleware({filter:ctx=>ctx.handlerType==='serverFn'})
export const startInstance=createStart(()=>({requestMiddleware:[csrf]}))
