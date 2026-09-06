import { boolean,index,integer,jsonb,pgEnum,pgTable,text,timestamp,uniqueIndex,uuid,vector } from 'drizzle-orm/pg-core'

export const appRole=pgEnum('app_role',['admin','moderator','user'])
export const docSource=pgEnum('doc_source',['oficial','comunidade','pessoal'])
export const docVisibility=pgEnum('doc_visibility',['private','public'])
export const docStatus=pgEnum('doc_status',['processing','pending_review','approved','rejected','failed'])
export const tipKind=pgEnum('tip_kind',['recomendacao','defeito_cronico','macete','peca','alerta'])

export const users=pgTable('users',{
 id:text('id').primaryKey(),name:text('name').notNull(),email:text('email').notNull().unique(),emailVerified:boolean('email_verified').notNull().default(false),image:text('image'),role:appRole('role').notNull().default('user'),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),
})
export const sessions=pgTable('sessions',{
 id:text('id').primaryKey(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),token:text('token').notNull().unique(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),ipAddress:text('ip_address'),userAgent:text('user_agent'),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
},t=>[index('sessions_user_idx').on(t.userId)])
export const accounts=pgTable('accounts',{
 id:text('id').primaryKey(),accountId:text('account_id').notNull(),issuer:text('issuer').notNull(),providerId:text('provider_id').notNull(),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),accessToken:text('access_token'),refreshToken:text('refresh_token'),idToken:text('id_token'),accessTokenExpiresAt:timestamp('access_token_expires_at',{withTimezone:true}),refreshTokenExpiresAt:timestamp('refresh_token_expires_at',{withTimezone:true}),scope:text('scope'),password:text('password'),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('accounts_user_idx').on(t.userId),uniqueIndex('accounts_issuer_account_unique').on(t.issuer,t.accountId)])
export const verifications=pgTable('verifications',{
 id:text('id').primaryKey(),identifier:text('identifier').notNull(),value:text('value').notNull(),expiresAt:timestamp('expires_at',{withTimezone:true}).notNull(),createdAt:timestamp('created_at',{withTimezone:true}).defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).defaultNow(),
},t=>[index('verifications_identifier_idx').on(t.identifier)])

export const vehicles=pgTable('vehicles',{
 id:uuid('id').primaryKey().defaultRandom(),make:text('make').notNull(),model:text('model').notNull(),generation:text('generation'),version:text('version'),yearStart:integer('year_start'),yearEnd:integer('year_end'),engineCode:text('engine_code'),engineLabel:text('engine_label'),fuel:text('fuel'),transmission:text('transmission'),vehicleKind:text('vehicle_kind').notNull().default('carro'),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('vehicles_lookup_idx').on(t.make,t.model,t.engineCode)])
export const documents=pgTable('documents',{
 id:uuid('id').primaryKey().defaultRandom(),ownerId:text('owner_id').notNull().references(()=>users.id,{onDelete:'cascade'}),vehicleId:uuid('vehicle_id').references(()=>vehicles.id,{onDelete:'set null'}),title:text('title').notNull(),description:text('description'),sourceType:docSource('source_type').notNull().default('comunidade'),visibility:docVisibility('visibility').notNull().default('private'),status:docStatus('status').notNull().default('processing'),storageKey:text('storage_key').notNull(),originalFilename:text('original_filename').notNull(),mimeType:text('mime_type').notNull().default('application/pdf'),fileSize:integer('file_size').notNull(),sha256:text('sha256').notNull(),pageCount:integer('page_count').notNull().default(0),chunkCount:integer('chunk_count').notNull().default(0),rightsDeclaration:text('rights_declaration'),errorMessage:text('error_message'),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('documents_owner_idx').on(t.ownerId),index('documents_vehicle_idx').on(t.vehicleId),uniqueIndex('documents_owner_hash_unique').on(t.ownerId,t.sha256)])
export const docChunks=pgTable('doc_chunks',{
 id:uuid('id').primaryKey().defaultRandom(),documentId:uuid('document_id').notNull().references(()=>documents.id,{onDelete:'cascade'}),vehicleId:uuid('vehicle_id').references(()=>vehicles.id,{onDelete:'set null'}),page:integer('page'),section:text('section'),content:text('content').notNull(),contentNorm:text('content_norm').notNull().default(''),embedding:vector('embedding',{dimensions:1536}),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('chunks_document_idx').on(t.documentId),index('chunks_vehicle_idx').on(t.vehicleId)])
export const auditLog=pgTable('audit_log',{
 id:uuid('id').primaryKey().defaultRandom(),userId:text('user_id'),action:text('action').notNull(),targetType:text('target_type'),targetId:text('target_id'),metadata:jsonb('metadata').notNull().default({}),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('audit_log_created_idx').on(t.createdAt),index('audit_log_user_idx').on(t.userId)])
export const answers=pgTable('answers',{
 id:uuid('id').primaryKey().defaultRandom(),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),vehicleId:uuid('vehicle_id').references(()=>vehicles.id,{onDelete:'set null'}),question:text('question').notNull(),answer:text('answer').notNull(),sources:jsonb('sources').notNull().default([]),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('answers_user_idx').on(t.userId)])
export const answerVotes=pgTable('answer_votes',{
 id:uuid('id').primaryKey().defaultRandom(),answerId:uuid('answer_id').notNull().references(()=>answers.id,{onDelete:'cascade'}),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),worked:boolean('worked').notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[uniqueIndex('answer_votes_unique').on(t.answerId,t.userId)])
export const tips=pgTable('tips',{
 id:uuid('id').primaryKey().defaultRandom(),authorId:text('author_id').notNull().references(()=>users.id,{onDelete:'cascade'}),vehicleId:uuid('vehicle_id').references(()=>vehicles.id,{onDelete:'set null'}),engineCode:text('engine_code'),topic:text('topic').notNull(),kind:tipKind('kind').notNull().default('recomendacao'),title:text('title').notNull(),body:text('body').notNull(),partNumber:text('part_number'),sourceNote:text('source_note'),status:docStatus('status').notNull().default('pending_review'),upvotes:integer('upvotes').notNull().default(0),downvotes:integer('downvotes').notNull().default(0),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),updatedAt:timestamp('updated_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[index('tips_vehicle_idx').on(t.vehicleId)])
export const tipVotes=pgTable('tip_votes',{
 id:uuid('id').primaryKey().defaultRandom(),tipId:uuid('tip_id').notNull().references(()=>tips.id,{onDelete:'cascade'}),userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}),worked:boolean('worked').notNull(),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
},t=>[uniqueIndex('tip_votes_unique').on(t.tipId,t.userId)])
export const videos=pgTable('videos',{
 id:uuid('id').primaryKey().defaultRandom(),vehicleId:uuid('vehicle_id').references(()=>vehicles.id,{onDelete:'cascade'}),submittedBy:text('submitted_by').references(()=>users.id,{onDelete:'set null'}),youtubeUrl:text('youtube_url').notNull(),youtubeId:text('youtube_id'),title:text('title').notNull(),component:text('component'),approved:boolean('approved').notNull().default(false),createdAt:timestamp('created_at',{withTimezone:true}).notNull().defaultNow(),
})
