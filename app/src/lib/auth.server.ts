import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { db } from '../db/client.server'
import { accounts,sessions,users,verifications } from '../db/schema'
import { sendMail } from './mailer.server'
const baseURL=process.env.BETTER_AUTH_URL||'http://localhost:3000'
const secret=process.env.BETTER_AUTH_SECRET||(process.env.NODE_ENV==='production'?undefined:'manuauto-desenvolvimento-local-trocar-em-producao-2026')
if(!secret)throw new Error('BETTER_AUTH_SECRET é obrigatório em produção.')
export const auth=betterAuth({baseURL,secret,database:drizzleAdapter(db,{provider:'pg',usePlural:true,schema:{users,sessions,accounts,verifications}}),emailAndPassword:{enabled:true,requireEmailVerification:process.env.AUTH_REQUIRE_EMAIL_VERIFICATION==='true',sendResetPassword:async({user,url})=>sendMail({to:user.email,subject:'Redefinição de senha do Manuauto',text:`Use este endereço para redefinir sua senha: ${url}`})},emailVerification:{sendOnSignUp:process.env.AUTH_REQUIRE_EMAIL_VERIFICATION==='true',sendVerificationEmail:async({user,url})=>sendMail({to:user.email,subject:'Confirme seu e-mail no Manuauto',text:`Confirme seu endereço: ${url}`})},user:{additionalFields:{role:{type:'string',input:false,defaultValue:'user'}}},session:{expiresIn:60*60*24*7,updateAge:60*60*24},trustedOrigins:[baseURL,'http://127.0.0.1:3000','https://*.e2b.app',...(process.env.TRUSTED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean)],rateLimit:{enabled:true,window:60,max:100},plugins:[tanstackStartCookies()]})
export type AuthSession=typeof auth.$Infer.Session
