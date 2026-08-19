import json
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class ProjectTests(unittest.TestCase):
 def test_owner_and_private_package(self):
  p=json.loads((ROOT/'app/package.json').read_text())
  self.assertEqual(p['author'],'Thomaz Fiuza');self.assertTrue(p['private']);self.assertEqual(p['license'],'UNLICENSED')
 def test_independent_stack(self):
  p=json.loads((ROOT/'app/package.json').read_text())
  for dep in ['better-auth','drizzle-orm','pg','@electric-sql/pglite','@aws-sdk/client-s3']:self.assertIn(dep,p['dependencies'])
 def test_schema_and_migration(self):
  schema=(ROOT/'app/src/db/schema.ts').read_text();migration=next((ROOT/'app/drizzle').glob('*.sql')).read_text()
  for token in ['documents','doc_chunks','tip_votes','vehicles','vector(1536)']:self.assertIn(token,schema if token!='vector(1536)' else migration)
 def test_no_real_secret_values(self):
  env=(ROOT/'app/.env.example').read_text();self.assertNotRegex(env,r'AI_API_KEY=.{20,}');self.assertIn('BETTER_AUTH_SECRET=',env)
if __name__=='__main__':unittest.main(verbosity=2)
